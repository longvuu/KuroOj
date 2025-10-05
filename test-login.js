const http = require('http');

function testLogin() {
  console.log('Testing login...');
  
  const data = JSON.stringify({
    usernameOrEmail: 'longvuu',
    password: 'admin123'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log(`\nStatus: ${res.statusCode}`);
      console.log('Response:', body);
      
      try {
        const parsed = JSON.parse(body);
        if (res.statusCode === 200) {
          console.log('\n✅ Login thành công!');
          console.log('User:', parsed.user);
        } else {
          console.log('\n❌ Login thất bại!');
          if (parsed.errors) {
            console.log('Validation errors:');
            parsed.errors.forEach(err => console.log(`  - ${err.msg} (field: ${err.path})`));
          }
        }
      } catch (e) {
        console.log('Parse error:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request error:', error.message);
  });

  req.write(data);
  req.end();
}

testLogin();
