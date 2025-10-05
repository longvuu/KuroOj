// ========================================
// DEBUG SCRIPT - Check Admin Role
// ========================================

console.clear();
console.log('='.repeat(50));
console.log('🔍 KIỂM TRA ADMIN ROLE');
console.log('='.repeat(50));

// 1. Check if user is logged in
const userStr = localStorage.getItem('user');
const token = localStorage.getItem('token');

console.log('\n📊 TRẠNG THÁI:');
console.log('- localStorage.user:', userStr ? '✅ Có' : '❌ Không');
console.log('- localStorage.token:', token ? '✅ Có' : '❌ Không');

if (!userStr) {
    console.log('\n❌ KHÔNG TÌM THẤY USER DATA!');
    console.log('👉 Bạn chưa đăng nhập hoặc đã logout');
    console.log('👉 Hãy login lại với user: longvuu');
    console.log('\n🔧 FIX:');
    console.log('   location.href = "/login"');
} else {
    try {
        const user = JSON.parse(userStr);
        
        console.log('\n👤 USER INFO:');
        console.log('- Username:', user.username);
        console.log('- Email:', user.email);
        console.log('- Role:', user.role);
        console.log('- Rating:', user.rating);
        
        console.log('\n🔍 KIỂM TRA ROLE:');
        console.log('- user.role === "admin":', user.role === 'admin');
        console.log('- typeof user.role:', typeof user.role);
        console.log('- Role value (raw):', JSON.stringify(user.role));
        
        if (user.role === 'admin') {
            console.log('\n✅ HOÀN HẢO! User là Admin!');
            console.log('👉 Menu Admin sẽ hiển thị');
            console.log('👉 Có thể truy cập /admin');
            console.log('\n🎛️ TRUY CẬP ADMIN:');
            console.log('   location.href = "/admin"');
        } else {
            console.log('\n❌ ROLE KHÔNG ĐÚNG!');
            console.log('   Expected: "admin"');
            console.log('   Got:', user.role);
            console.log('\n🔧 CÁC NGUYÊN NHÂN CÓ THỂ:');
            console.log('   1. Token cũ (trước khi set admin)');
            console.log('   2. Chưa logout sau khi set admin');
            console.log('   3. Role bị sai trong database');
            
            console.log('\n🔧 GIẢI PHÁP:');
            console.log('   1. Logout và login lại:');
            console.log('      localStorage.clear()');
            console.log('      location.href = "/login"');
            console.log('   ');
            console.log('   2. Hoặc verify trong database:');
            console.log('      node backend/scripts/set-admin.js longvuu');
        }
        
        // Full user object
        console.log('\n📝 FULL USER OBJECT:');
        console.log(user);
        
    } catch (e) {
        console.log('\n❌ LỖI PARSE USER DATA!');
        console.log('Error:', e.message);
        console.log('Raw data:', userStr);
        console.log('\n🔧 FIX:');
        console.log('   localStorage.clear()');
        console.log('   location.href = "/login"');
    }
}

console.log('\n' + '='.repeat(50));
console.log('🎯 QUICK ACTIONS:');
console.log('='.repeat(50));
console.log('// Clear storage và login lại:');
console.log('localStorage.clear(); location.href = "/login"');
console.log('');
console.log('// Reload page:');
console.log('location.reload()');
console.log('');
console.log('// Go to admin (if already admin):');
console.log('location.href = "/admin"');
console.log('='.repeat(50));
