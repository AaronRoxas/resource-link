/**
 * ResourceLink Advanced Recommendation Engine
 * 
 * This module implements a hybrid recommendation system combining:
 * 1. Collaborative filtering (user-based)
 * 2. Content-based filtering
 * 3. Popularity-based recommendations
 * 
 * The algorithm uses TF-IDF for content analysis and cosine similarity
 * for measuring similarities between items and users.
 */

const mongoose = require('mongoose');
const Borrowing = require('../models/Borrowing');
const Item = require('../models/Item');
const User = require('../models/User');
const Category = require('../models/Category');

// TF-IDF implementation for content analysis
class TFIDF {
  constructor() {
    this.documents = [];
    this.vocab = new Set();
    this.idf = {};
    this.tfidf = [];
  }

  // Add a document to the corpus
  addDocument(doc) {
    this.documents.push(doc);
    for (const term of doc) {
      this.vocab.add(term);
    }
  }

  // Calculate term frequency for a term in a document
  calculateTF(term, doc) {
    const termCount = doc.filter(t => t === term).length;
    return termCount / doc.length;
  }

  // Calculate inverse document frequency for a term
  calculateIDF(term) {
    if (this.idf[term]) return this.idf[term];
    
    const docsWithTerm = this.documents.filter(doc => doc.includes(term)).length;
    this.idf[term] = Math.log(this.documents.length / (1 + docsWithTerm));
    return this.idf[term];
  }

  // Calculate TF-IDF for all documents
  calculateTFIDF() {
    this.tfidf = this.documents.map(doc => {
      const docTFIDF = {};
      for (const term of this.vocab) {
        const tf = this.calculateTF(term, doc);
        const idf = this.calculateIDF(term);
        docTFIDF[term] = tf * idf;
      }
      return docTFIDF;
    });
    return this.tfidf;
  }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  const dotProduct = Object.keys(vecA)
    .filter(key => key in vecB)
    .reduce((sum, key) => sum + vecA[key] * vecB[key], 0);

  const magnitudeA = Math.sqrt(Object.values(vecA).reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(Object.values(vecB).reduce((sum, val) => sum + val * val, 0));

  return dotProduct / (magnitudeA * magnitudeB) || 0;
}

// Main recommendation engine class
class RecommendationEngine {
  constructor() {
    this.userItemMatrix = {}; // user-item interaction matrix
    this.itemFeatures = {}; // item content features
    this.userSimilarities = {}; // cache for user similarities
    this.itemSimilarities = {}; // cache for item similarities
    this.popularItems = []; // popular items ranked by borrow count
    this.lastUpdate = null;
    this.updateInterval = 3600000; // Update every hour
    this.tfidf = new TFIDF();
  }

  // Initialize the recommendation engine with data
  async initialize() {
    if (this.lastUpdate && Date.now() - this.lastUpdate < this.updateInterval) {
      return; // Skip update if data is recent
    }

    // Reset data structures
    this.userItemMatrix = {};
    this.itemFeatures = {};
    this.userSimilarities = {};
    this.itemSimilarities = {};
    this.popularItems = [];
    this.tfidf = new TFIDF();

    // Build user-item interaction matrix from borrowing history
    const borrowings = await Borrowing.find()
      .populate('user')
      .populate('item')
      .populate({
        path: 'item',
        populate: {
          path: 'category'
        }
      })
      .lean();

    // Build user-item matrix and collect item features
    for (const borrowing of borrowings) {
      if (!borrowing.user || !borrowing.item) continue;
      
      const userId = borrowing.user._id.toString();
      const itemId = borrowing.item._id.toString();
      
      // Initialize user if not exists
      if (!this.userItemMatrix[userId]) {
        this.userItemMatrix[userId] = {};
      }
      
      // Calculate interaction strength (1 for borrowed, weight higher for multiple borrows)
      this.userItemMatrix[userId][itemId] = (this.userItemMatrix[userId][itemId] || 0) + 1;
      
      // Extract item features if not already done
      if (!this.itemFeatures[itemId]) {
        // Create feature vector from item properties
        const features = [
          borrowing.item.name,
          borrowing.item.description,
          borrowing.item.status,
          borrowing.item.category ? borrowing.item.category.name : '',
          ...borrowing.item.tags || []
        ].filter(Boolean);
        
        this.itemFeatures[itemId] = features;
        this.tfidf.addDocument(features);
      }
    }
    
    // Calculate TF-IDF vectors for items
    const tfidfVectors = this.tfidf.calculateTFIDF();
    const itemIds = Object.keys(this.itemFeatures);
    
    // Convert item features to TF-IDF vectors
    for (let i = 0; i < itemIds.length; i++) {
      this.itemFeatures[itemIds[i]] = tfidfVectors[i];
    }
    
    // Calculate item similarities based on content features
    for (let i = 0; i < itemIds.length; i++) {
      const itemId1 = itemIds[i];
      this.itemSimilarities[itemId1] = {};
      
      for (let j = 0; j < itemIds.length; j++) {
        if (i === j) continue;
        
        const itemId2 = itemIds[j];
        const similarity = cosineSimilarity(
          this.itemFeatures[itemId1], 
          this.itemFeatures[itemId2]
        );
        
        this.itemSimilarities[itemId1][itemId2] = similarity;
      }
    }
    
    // Calculate popularity scores
    const popularityScores = {};
    for (const borrowing of borrowings) {
      if (!borrowing.item) continue;
      
      const itemId = borrowing.item._id.toString();
      popularityScores[itemId] = (popularityScores[itemId] || 0) + 1;
    }
    
    // Sort items by popularity
    this.popularItems = Object.entries(popularityScores)
      .sort((a, b) => b[1] - a[1])
      .map(([itemId]) => itemId);
    
    this.lastUpdate = Date.now();
  }

  // Get user-based collaborative filtering recommendations
  async getUserBasedRecommendations(userId, limit = 5) {
    await this.initialize();
    
    if (!this.userItemMatrix[userId]) {
      return this.getPopularRecommendations(limit);
    }
    
    // Calculate user similarities if not cached
    if (!this.userSimilarities[userId]) {
      this.userSimilarities[userId] = {};
      
      for (const otherUserId of Object.keys(this.userItemMatrix)) {
        if (userId === otherUserId) continue;
        
        // Convert user-item interactions to vectors
        const userVector = this.userItemMatrix[userId];
        const otherUserVector = this.userItemMatrix[otherUserId];
        
        // Calculate similarity
        const similarity = cosineSimilarity(userVector, otherUserVector);
        this.userSimilarities[userId][otherUserId] = similarity;
      }
    }
    
    // Get items from similar users that the current user hasn't interacted with
    const candidateItems = new Set();
    const userItems = new Set(Object.keys(this.userItemMatrix[userId]));
    
    // Get top similar users
    const similarUsers = Object.entries(this.userSimilarities[userId])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    // Get items from similar users
    for (const [similarUserId, similarity] of similarUsers) {
      if (similarity <= 0) continue;
      
      for (const itemId of Object.keys(this.userItemMatrix[similarUserId])) {
        if (!userItems.has(itemId)) {
          candidateItems.add(itemId);
        }
      }
    }
    
    // Score candidate items based on similar users' preferences
    const itemScores = {};
    for (const itemId of candidateItems) {
      let score = 0;
      let totalSimilarity = 0;
      
      for (const [similarUserId, similarity] of similarUsers) {
        if (this.userItemMatrix[similarUserId][itemId]) {
          score += similarity * this.userItemMatrix[similarUserId][itemId];
          totalSimilarity += similarity;
        }
      }
      
      if (totalSimilarity > 0) {
        itemScores[itemId] = score / totalSimilarity;
      }
    }
    
    // Return top scored items
    const recommendations = Object.entries(itemScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([itemId]) => itemId);
    
    return recommendations;
  }

  // Get content-based recommendations based on user history
  async getContentBasedRecommendations(userId, limit = 5) {
    await this.initialize();
    
    if (!this.userItemMatrix[userId]) {
      return this.getPopularRecommendations(limit);
    }
    
    // Get items the user has interacted with
    const userItems = Object.keys(this.userItemMatrix[userId]);
    if (userItems.length === 0) {
      return this.getPopularRecommendations(limit);
    }
    
    // Calculate weighted average score for all items based on similarity to user's items
    const itemScores = {};
    const allItems = Object.keys(this.itemFeatures);
    const userItemsSet = new Set(userItems);
    
    for (const itemId of allItems) {
      if (userItemsSet.has(itemId)) continue; // Skip items user already interacted with
      
      let totalScore = 0;
      let totalWeight = 0;
      
      for (const userItemId of userItems) {
        const similarity = this.itemSimilarities[userItemId]?.[itemId] || 0;
        const weight = this.userItemMatrix[userId][userItemId];
        
        totalScore += similarity * weight;
        totalWeight += weight;
      }
      
      if (totalWeight > 0) {
        itemScores[itemId] = totalScore / totalWeight;
      }
    }
    
    // Return top scored items
    const recommendations = Object.entries(itemScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([itemId]) => itemId);
    
    return recommendations;
  }

  // Get popularity-based recommendations
  async getPopularRecommendations(limit = 5) {
    await this.initialize();
    return this.popularItems.slice(0, limit);
  }

  // Get hybrid recommendations (combining all methods)
  async getHybridRecommendations(userId, limit = 10) {
    await this.initialize();
    
    // Get recommendations from each method
    const [collaborative, contentBased, popular] = await Promise.all([
      this.getUserBasedRecommendations(userId, limit),
      this.getContentBasedRecommendations(userId, limit),
      this.getPopularRecommendations(limit)
    ]);
    
    // Combine recommendations with weights
    const scoreMap = {};
    
    // Add collaborative filtering recommendations with highest weight
    for (let i = 0; i < collaborative.length; i++) {
      scoreMap[collaborative[i]] = (scoreMap[collaborative[i]] || 0) + (limit - i) * 3;
    }
    
    // Add content-based recommendations with medium weight
    for (let i = 0; i < contentBased.length; i++) {
      scoreMap[contentBased[i]] = (scoreMap[contentBased[i]] || 0) + (limit - i) * 2;
    }
    
    // Add popularity-based recommendations with lowest weight
    for (let i = 0; i < popular.length; i++) {
      scoreMap[popular[i]] = (scoreMap[popular[i]] || 0) + (limit - i);
    }
    
    // Get the top scored items
    const recommendations = Object.entries(scoreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([itemId]) => itemId);
    
    return recommendations;
  }

  // Format recommendations with full item details
  async formatRecommendations(itemIds) {
    const items = await Item.find({
      _id: { $in: itemIds.map(id => mongoose.Types.ObjectId(id)) }
    }).populate('category').lean();
    
    // Order items by the recommendation order
    const orderedItems = [];
    for (const id of itemIds) {
      const item = items.find(i => i._id.toString() === id);
      if (item) orderedItems.push(item);
    }
    
    return orderedItems;
  }
}

// Create a singleton instance
const recommendationEngine = new RecommendationEngine();

// Export recommendation functions
module.exports = {
  /**
   * Get recommended items for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of recommendations to return
   * @returns {Promise<Array>} - Array of recommended items
   */
  getRecommendedItems: async (userId, limit = 5) => {
    const itemIds = await recommendationEngine.getHybridRecommendations(userId, limit);
    return recommendationEngine.formatRecommendations(itemIds);
  },
  
  /**
   * Get similar items to a specific item
   * @param {string} itemId - Item ID
   * @param {number} limit - Number of similar items to return
   * @returns {Promise<Array>} - Array of similar items
   */
  getSimilarItems: async (itemId, limit = 5) => {
    await recommendationEngine.initialize();
    
    if (!recommendationEngine.itemSimilarities[itemId]) {
      return [];
    }
    
    const similarItemIds = Object.entries(recommendationEngine.itemSimilarities[itemId])
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
    
    return recommendationEngine.formatRecommendations(similarItemIds);
  },
  
  /**
   * Get trending items based on recent borrows
   * @param {number} limit - Number of trending items to return
   * @param {number} days - Number of days to consider for trending
   * @returns {Promise<Array>} - Array of trending items
   */
  getTrendingItems: async (limit = 5, days = 7) => {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    // Get recent borrowings
    const recentBorrowings = await Borrowing.find({
      createdAt: { $gte: dateThreshold }
    }).populate('item');
    
    // Count item frequencies
    const itemCounts = {};
    for (const borrowing of recentBorrowings) {
      if (!borrowing.item) continue;
      
      const itemId = borrowing.item._id.toString();
      itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
    }
    
    // Get top items
    const trendingItemIds = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
    
    return recommendationEngine.formatRecommendations(trendingItemIds);
  }
};