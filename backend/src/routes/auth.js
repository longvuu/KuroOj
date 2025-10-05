const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// Đăng ký
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username phải từ 3-30 ký tự'),
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  ],
  authController.register
);

// Đăng nhập
router.post(
  '/login',
  [
    body('usernameOrEmail').trim().notEmpty().withMessage('Vui lòng nhập username hoặc email'),
    body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu'),
  ],
  authController.login
);

// Lấy thông tin user hiện tại
router.get('/me', authController.authenticate, authController.getMe);

// Xác nhận email
router.get('/verify-email/:token', authController.verifyEmail);

// Gửi lại email xác nhận
router.post('/resend-verification', authController.resendVerificationEmail);

module.exports = router;
