const nodemailer = require('nodemailer');
const crypto = require('crypto');
const axios = require('axios');

// Gửi email qua Mailtrap API
const sendMailtrapAPI = async (to, subject, html) => {
  try {
    const response = await axios.post(
      'https://send.api.mailtrap.io/api/send',
      {
        from: {
          email: process.env.MAILTRAP_FROM_EMAIL || 'hello@demomailtrap.com',
          name: 'KuroOJ',
        },
        to: [{ email: to }],
        subject: subject,
        html: html,
        category: 'Email Verification',
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MAILTRAP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log(`✅ Đã gửi email qua Mailtrap API tới ${to}`);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi Mailtrap API:', error.response?.data || error.message);
    throw error;
  }
};

// Tạo transporter (sử dụng Gmail hoặc service khác)
const createTransporter = () => {
  // Option 1: Gmail (cần App Password)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // App Password, không phải mật khẩu thường
      },
    });
  }
  
  // Option 2: Mailtrap (cho testing)
  if (process.env.EMAIL_SERVICE === 'mailtrap') {
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  
  // Option 3: SMTP custom
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Tạo verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Gửi email xác nhận
const sendVerificationEmail = async (user, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Chào mừng đến với KuroOJ! 🎉</h2>
        <p>Xin chào <strong>${user.username}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại KuroOJ. Vui lòng xác nhận email của bạn bằng cách nhấn vào nút bên dưới:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Xác nhận email
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Hoặc copy link sau vào trình duyệt:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Link này sẽ hết hạn sau <strong>24 giờ</strong>.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
        </p>
      </div>
    `;

    // Dùng Mailtrap API nếu được cấu hình
    if (process.env.EMAIL_SERVICE === 'mailtrap-api') {
      await sendMailtrapAPI(user.email, 'Xác nhận tài khoản KuroOJ', htmlContent);
      return true;
    }
    
    // Fallback sang SMTP
    const transporter = createTransporter();
    const fromEmail = process.env.EMAIL_NOREPLY || process.env.EMAIL_USER;
    const fromName = process.env.EMAIL_FROM_NAME || 'KuroOJ';
    
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: user.email,
      subject: 'Xác nhận tài khoản KuroOJ',
      html: htmlContent,
      replyTo: 'noreply@kurooj.com', // Không cho reply
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Đã gửi email xác nhận tới ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email xác nhận');
  }
};

// Gửi email reset password
const sendResetPasswordEmail = async (user, token) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    const fromEmail = process.env.EMAIL_NOREPLY || process.env.EMAIL_USER;
    const fromName = process.env.EMAIL_FROM_NAME || 'KuroOJ';
    
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: user.email,
      subject: 'Đặt lại mật khẩu KuroOJ',
      replyTo: 'noreply@kurooj.com',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Đặt lại mật khẩu</h2>
          <p>Xin chào <strong>${user.username}</strong>,</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để tiếp tục:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Hoặc copy link sau vào trình duyệt:<br>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            Link này sẽ hết hạn sau <strong>1 giờ</strong>.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          </p>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Đã gửi email reset password tới ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email đặt lại mật khẩu');
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendResetPasswordEmail,
};
