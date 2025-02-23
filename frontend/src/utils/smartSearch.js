// Levenshtein Distance calculation for fuzzy matching
const levenshteinDistance = (str1, str2) => {
    if (!str1 || !str2) return 0;
    str1 = String(str1);
    str2 = String(str2);
    
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) track[0][i] = i;
    for (let j = 0; j <= str2.length; j++) track[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator
            );
        }
    }
    return track[str2.length][str1.length];
};

// Calculate similarity score between two strings (0 to 1, where 1 is exact match)
const calculateSimilarity = (str1, str2) => {
    if (!str1 || !str2) return 0;
    str1 = String(str1);
    str2 = String(str2);
    
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0;
    const distance = levenshteinDistance(str1, str2);
    return 1 - (distance / maxLength);
};

// Smart search function that returns items with similarity scores
export const smartSearch = (items, searchTerm, threshold = 0.3) => {
    if (!items || !Array.isArray(items)) return [];
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
        return items.map(item => ({ ...item, score: 1 }));
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return items.map(item => {
        // Calculate similarity scores for different fields
        const nameScore = calculateSimilarity(
            (item.name || '').toLowerCase(), 
            searchTermLower
        );
        const idScore = calculateSimilarity(
            (item.id || '').toLowerCase(), 
            searchTermLower
        );
        
        // Get the best match score
        const score = Math.max(nameScore, idScore);
        
        return {
            ...item,
            score
        };
    })
    .filter(item => item.score > threshold) // Filter out low-scoring matches
    .sort((a, b) => b.score - a.score); // Sort by score, highest first
};

// Get highlighted text with matching parts emphasized
export const getHighlightedText = (text, searchTerm) => {
    if (!text || !searchTerm || typeof searchTerm !== 'string') {
        return { parts: [text || ''], hasMatch: false };
    }
    
    text = String(text);
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return {
        parts,
        hasMatch: parts.length > 1
    };
};
