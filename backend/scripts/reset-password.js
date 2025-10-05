const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://long:admin@kuro.9jmui2x.mongodb.net/kurooj';
const USERNAME = 'longvuu';
const NEW_PASSWORD = 'admin123'; // Password mặc định

console.log('==================================================');
console.log('  🔐 RESET PASSWORD FOR USER');
console.log('==================================================');
console.log(`Target user: ${USERNAME}`);
console.log(`New password: ${NEW_PASSWORD}`);
console.log('==================================================');

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('🔌 Connecting to MongoDB Atlas...');
    console.log('✅ Connected to MongoDB\n');

    console.log(`🔍 Finding user "${USERNAME}"...`);
    const user = await User.findOne({ username: USERNAME });

    if (!user) {
      console.log(`❌ User "${USERNAME}" không tồn tại!`);
      console.log('\n💡 Hãy đăng ký user mới tại: http://localhost:3000/register');
      process.exit(1);
    }

    console.log('✅ Found user:');
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Current role: ${user.role}`);
    console.log(`   - Has password: ${!!user.password}\n`);

    // Set new password
    console.log('🔄 Setting new password...');
    user.password = NEW_PASSWORD;
    await user.save();

    console.log('✅ Password đã được reset!\n');

    // Verify
    const updatedUser = await User.findOne({ username: USERNAME }).select('+password');
    console.log('✅ Verification:');
    console.log(`   - Username: ${updatedUser.username}`);
    console.log(`   - Email: ${updatedUser.email}`);
    console.log(`   - Role: ${updatedUser.role}`);
    console.log(`   - Has password hash: ${!!updatedUser.password}`);
    console.log(`   - Password hash length: ${updatedUser.password?.length || 0}\n`);

    // Test password
    const isMatch = await updatedUser.comparePassword(NEW_PASSWORD);
    console.log(`🔍 Test password "${NEW_PASSWORD}": ${isMatch ? '✅ ĐÚNG' : '❌ SAI'}\n`);

    console.log('🎉 HOÀN TẤT!\n');
    console.log('📝 Thông tin đăng nhập:');
    console.log('==================================================');
    console.log(`   Username: ${USERNAME}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    console.log('==================================================');
    console.log('\n🚀 Bây giờ có thể đăng nhập tại: http://localhost:3000/login\n');

    mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
