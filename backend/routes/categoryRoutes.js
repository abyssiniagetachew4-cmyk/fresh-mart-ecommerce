const express = require('express');
const router = express.Router();
const { createCategory, getCategories } = require('../controllers/categoryController');

// Routes
router.post('/', createCategory);      // Add category (admin)
router.get('/', getCategories);        // Get all categories

module.exports = router;
