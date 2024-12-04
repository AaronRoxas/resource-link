const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new category
router.post('/', async (req, res) => {
    try {
        // Check if image data already includes the prefix
        const imageData = req.body.image.startsWith('data:') 
            ? req.body.image 
            : `data:image/png;base64,${req.body.image}`;

        const category = new Category({
            name: req.body.name,
            description: req.body.description,
            image: imageData
        });
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update category
router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                image: req.body.image,
                subCategories: req.body.subCategories
            },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.patch('/:id/subcategories', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.subCategories.push({ name: req.body.name });
        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get count of items by category
router.get('/count-by-category', async (req, res) => {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: 'items',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'items'
                }
            },
            {
                $project: {
                    name: 1,
                    itemCount: { $size: '$items' }
                }
            }
        ]);
        
        res.json(categories);
    } catch (error) {
        console.error('Error getting item counts:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 