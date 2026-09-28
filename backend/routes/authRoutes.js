const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Test route
router.get('/test', (req, res) => res.json({ message: 'Auth route working ✅' }));

// Get all users (admin only)
router.get('/all', protect, adminOnly, authController.getAllUsers);

module.exports = router;
