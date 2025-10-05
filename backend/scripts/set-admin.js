const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB URI từ .env hoặc hardcode
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://long:admin@kuro.9jmui2x.mongodb.net/kurooj?retryWrites=true&w=majority&appName=Kuro';

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  rating: { type: Number, default: 1500 },
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function setUserAsAdmin(username) {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log(`\n🔍 Finding user "${username}"...`);
    const user = await User.findOne({ username });

    if (!user) {
      console.log(`❌ User "${username}" không tồn tại trong database!`);
      console.log('\n💡 Gợi ý: Hãy đăng ký tài khoản này trước.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`✅ Found user:`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Current role: ${user.role}`);

    if (user.role === 'admin') {
      console.log(`\nℹ️  User "${username}" đã là Admin rồi!`);
    } else {
      console.log(`\n🔄 Updating role to "admin"...`);
      user.role = 'admin';
      await user.save();
      console.log(`✅ User "${username}" đã được set là Admin!`);
    }

    console.log(`\n✅ Final user info:`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Rating: ${user.rating}`);

    console.log('\n🎉 HOÀN TẤT!');
    console.log('\n📝 Bước tiếp theo:');
    console.log('   1. Logout (nếu đang đăng nhập)');
    console.log('   2. Login lại với user "' + username + '"');
    console.log('   3. Thấy menu "🎛️ Admin" trên navbar');
    console.log('   4. Click vào → http://localhost:3000/admin');

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Get username từ command line argument
const username = process.argv[2] || 'longvuu';

console.log('='.repeat(50));
console.log('  🎛️ SET USER AS ADMIN');
console.log('='.repeat(50));
console.log(`Target user: ${username}`);
console.log('='.repeat(50));

setUserAsAdmin(username);
