const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
};

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const resetUsers = async () => {
  try {
    await connectDB();

    // Tìm user admin longvuu
    const adminUser = await User.findOne({ username: 'longvuu' });
    
    if (!adminUser) {
      console.log('❌ Không tìm thấy user admin longvuu!');
      console.log('📝 Tạo user admin mới...');
      
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        username: 'longvuu',
        email: 'longvuha2004@gmail.com',
        password: hashedPassword,
        fullName: 'Long Vu',
        role: 'admin',
        isEmailVerified: true,
        rating: 1500,
      });
      
      console.log('✅ Đã tạo user admin longvuu');
      console.log('   Username: longvuu');
      console.log('   Password: admin123');
    } else {
      console.log('✅ Tìm thấy user admin:', adminUser.username);
    }

    // Xóa tất cả users trừ longvuu
    const deleteResult = await User.deleteMany({ 
      username: { $ne: 'longvuu' } 
    });

    console.log(`🗑️  Đã xóa ${deleteResult.deletedCount} users`);
    console.log('✅ Hoàn thành! Chỉ còn user admin longvuu');

    // Hiển thị danh sách users còn lại
    const remainingUsers = await User.find({});
    console.log('\n📋 Danh sách users còn lại:');
    remainingUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - Role: ${user.role || 'user'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

resetUsers();
