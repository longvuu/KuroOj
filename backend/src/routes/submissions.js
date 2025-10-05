const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const submissionUpdateController = require('../controllers/submissionUpdateController');
const { authenticate } = require('../controllers/authController');

// Routes cần đăng nhập
router.post('/', authenticate, submissionController.createSubmission);
router.post('/run', authenticate, submissionController.runCode); // Run code without submitting
router.get('/', authenticate, submissionController.getSubmissions);
router.get('/:id', authenticate, submissionController.getSubmission);

// Routes cho judge service (không cần auth vì gọi internal)
router.patch('/:id/status', submissionUpdateController.updateSubmissionStatus);
router.patch('/:id/result', submissionUpdateController.updateSubmissionResult);

module.exports = router;
