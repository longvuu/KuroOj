const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../controllers/authController');

// Public routes
router.get('/profile/:username', userController.getUserProfile);

// Protected routes
router.put('/profile', authenticate, userController.updateProfile);

// Admin routes
router.get('/', authenticate, isAdmin, userController.getAllUsers);
router.get('/stats', authenticate, isAdmin, userController.getUserStats);

module.exports = router;
