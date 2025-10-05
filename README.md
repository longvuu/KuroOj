# KuroOJ - Online Judge Platform

## Giới thiệu
KuroOJ là một nền tảng Online Judge tiếng Việt giúp các bạn luyện tập giải thuật toán với C++ và Python.

**Đặc điểm kỹ thuật:**
- 🗄️ NoSQL Database (MongoDB) - Schema linh hoạt, performance cao
- ⚡ In-Memory Mode - Demo nhanh không cần cài database
- 🔄 RESTful API - Chuẩn REST architecture
- 🎨 Modern UI - React + Tailwind CSS responsive design

## Tính năng chính
- ✅ Nộp bài với C++ và Python
- ✅ Chấm bài tự động
- ✅ Quản lý đề bài
- ✅ Xem kết quả và lịch sử nộp bài
- ✅ Bảng xếp hạng
- ✅ Hệ thống test cases
- ✅ Giới hạn thời gian và bộ nhớ
- ✅ **Admin Dashboard** - Quản trị toàn diện
  - 📊 Thống kê tổng quan (users, problems, submissions)
  - 👥 Quản lý người dùng
  - 📝 Quản lý bài toán (CRUD)
  - 📈 Xem và phân tích submissions

## Công nghệ sử dụng
- **Backend**: Node.js + Express
- **Frontend**: React + Tailwind CSS
- **Database**: MongoDB (NoSQL) với Mongoose ODM
- **Judge System**: Code execution engine với sandboxing
- **Queue**: Bull (Redis) để xử lý hàng đợi chấm bài (optional)
- **In-Memory Mode**: Hỗ trợ chạy demo không cần database

## Cấu trúc dự án
```
KuroOj/
├── backend/          # API server
├── frontend/         # React app
├── judge/            # Code execution engine
└── docker/           # Docker configs
```

## Cài đặt

### Yêu cầu
- Node.js 18+
- MongoDB (NoSQL Database) - Optional, có thể dùng In-Memory mode
- Redis - Optional, cho production queue
- Python 3.x - Để chấm code Python
- g++ compiler - Để chấm code C++

### Chạy nhanh (In-Memory Mode - Không cần MongoDB/Redis)
```bash
# Backend
cd backend
npm install
npm run start:simple

# Judge Service
cd judge
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

### Chạy Production (Với MongoDB)
```bash
# Cài đặt và chạy MongoDB
mongod

# Backend với MongoDB
cd backend
npm install
npm start

# Judge Service
cd judge
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

## 🎛️ Admin Dashboard

### Truy cập Admin
```
URL: http://localhost:3000/admin
```

**User đầu tiên tự động là Admin!**

### Tính năng Admin
- 📊 **Dashboard**: Thống kê tổng quan (users, problems, submissions, AC rate)
- 👥 **Quản lý Users**: Xem danh sách, stats, recent users
- 📝 **Quản lý Bài toán**: CRUD operations, search, filter
- 📈 **Xem Submissions**: Monitor tất cả bài nộp, status tracking
- ⚡ **Quick Actions**: Các thao tác nhanh

### Hướng dẫn chi tiết
- **Admin Guide**: Xem file `ADMIN_GUIDE.md`
- **Setup Summary**: Xem file `ADMIN_SETUP_SUMMARY.md`

## 📚 Documentation

- 📖 **Installation Guide**: `INSTALLATION_GUIDE.md` - Hướng dẫn cài đặt từ đầu đến cuối
- 🎛️ **Admin Guide**: `ADMIN_GUIDE.md` - Hướng dẫn sử dụng Admin Dashboard
- 🗄️ **MongoDB Setup**: `MONGODB_SETUP.md` - Cài đặt MongoDB chi tiết
- 📊 **NoSQL Info**: `WHY_NOSQL.md` và `NOSQL_COMPARISON.md`

## License
MIT
