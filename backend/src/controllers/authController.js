const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateVerificationToken, sendVerificationEmail } = require('../services/emailService');

// Đăng ký
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password, fullName } = req.body;

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc username đã tồn tại',
      });
    }

    // Tạo user mới (TỰ ĐỘNG verify - không cần email)
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      isEmailVerified: true, // TỰ ĐỘNG verify
    });

    console.log(`✅ Tạo user mới: ${username}, email: ${email}, tự động verified`);

    // Tạo JWT token để tự động đăng nhập
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        rating: user.rating,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { usernameOrEmail, password } = req.body;

    // Tìm user theo username hoặc email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username/Email hoặc mật khẩu không đúng',
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username/Email hoặc mật khẩu không đúng',
      });
    }

    console.log(`✅ Login success: ${user.username}`);

    // Tạo JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        rating: user.rating,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Middleware xác thực
exports.authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để truy cập',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User không tồn tại',
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
    });
  }
};

// Middleware kiểm tra admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện hành động này',
    });
  }
  next();
};

// Lấy thông tin user hiện tại
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('solvedProblems', 'title slug difficulty');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xác nhận email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Tìm user với token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
      });
    }

    // Đánh dấu email đã xác nhận
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Tạo JWT token để tự động đăng nhập
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.json({
      success: true,
      message: 'Email đã được xác nhận thành công!',
      token: authToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        rating: user.rating,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Gửi lại email xác nhận
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Email không tồn tại',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được xác nhận rồi',
      });
    }

    // Tạo token mới
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Gửi email
    await sendVerificationEmail(user, verificationToken);

    res.json({
      success: true,
      message: 'Email xác nhận đã được gửi lại',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
