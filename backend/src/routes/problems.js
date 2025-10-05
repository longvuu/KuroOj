const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { authenticate, isAdmin } = require('../controllers/authController');

// Public routes
router.get('/', problemController.getProblems);
router.get('/:slug', problemController.getProblem);

// Protected routes (cần đăng nhập)
router.post('/', authenticate, isAdmin, problemController.createProblem);
router.put('/:id', authenticate, isAdmin, problemController.updateProblem);
router.delete('/:id', authenticate, isAdmin, problemController.deleteProblem);

module.exports = router;
