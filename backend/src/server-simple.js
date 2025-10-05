const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage cho demo (thay thế MongoDB)
const users = [];
const problems = [];
const submissions = [];

// Mock data
const sampleProblems = [
  {
    _id: '1',
    title: 'Tổng hai số',
    slug: 'tong-hai-so',
    description: 'Cho hai số nguyên a và b. Hãy tính tổng a + b.',
    inputFormat: 'Một dòng chứa hai số nguyên a và b (1 ≤ a, b ≤ 10^9)',
    outputFormat: 'In ra một số nguyên là tổng a + b',
    constraints: '1 ≤ a, b ≤ 10^9',
    examples: [
      {
        input: '3 5',
        output: '8',
        explanation: '3 + 5 = 8'
      }
    ],
    testCases: [
      { input: '3 5', output: '8', isHidden: false },
      { input: '10 20', output: '30', isHidden: false },
      { input: '100 200', output: '300', isHidden: true }
    ],
    difficulty: 'Dễ',
    tags: ['math', 'beginner'],
    timeLimit: 1000,
    memoryLimit: 256,
    acceptedCount: 0,
    submissionCount: 0,
    isPublic: true,
  }
];

problems.push(...sampleProblems);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'KuroOJ Backend is running (In-Memory Mode)' });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, fullName } = req.body;
  
  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email hoặc username đã tồn tại',
    });
  }

  const user = {
    _id: Date.now().toString(),
    username,
    email,
    fullName,
    role: users.length === 0 ? 'admin' : 'user', // User đầu tiên là admin
    rating: 1500,
    solvedProblems: [],
    submissions: 0,
    acceptedSubmissions: 0,
  };

  users.push(user);

  res.status(201).json({
    success: true,
    token: 'demo-token-' + user._id,
    user,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không đúng',
    });
  }

  res.json({
    success: true,
    token: 'demo-token-' + user._id,
    user,
  });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userId = token?.replace('demo-token-', '');
  const user = users.find(u => u._id === userId);

  if (!user) {
    return res.status(401).json({ success: false, message: 'User không tồn tại' });
  }

  res.json({ success: true, user });
});

// Problem routes
app.get('/api/problems', (req, res) => {
  const { difficulty, search } = req.query;
  
  let filtered = problems.filter(p => p.isPublic);
  
  if (difficulty) {
    filtered = filtered.filter(p => p.difficulty === difficulty);
  }
  
  if (search) {
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({
    success: true,
    problems: filtered.map(p => ({ ...p, testCases: undefined })),
    totalPages: 1,
    currentPage: 1,
    total: filtered.length,
  });
});

app.get('/api/problems/:slug', (req, res) => {
  const problem = problems.find(p => p.slug === req.params.slug);
  
  if (!problem) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài toán',
    });
  }

  const { testCases, ...problemData } = problem;
  res.json({ success: true, problem: problemData });
});

// Submission routes
app.post('/api/submissions', async (req, res) => {
  const { problemId, language, code } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  const userId = token?.replace('demo-token-', '');
  const user = users.find(u => u._id === userId);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
  }

  const problem = problems.find(p => p._id === problemId);
  if (!problem) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy bài toán' });
  }

  const submission = {
    _id: Date.now().toString(),
    user: { _id: user._id, username: user.username },
    problem: { _id: problem._id, title: problem.title, slug: problem.slug, difficulty: problem.difficulty },
    language,
    code,
    status: 'Pending',
    testResults: [],
    executionTime: 0,
    memoryUsed: 0,
    score: 0,
    errorMessage: '',
    createdAt: new Date(),
  };

  submissions.push(submission);
  problem.submissionCount++;
  user.submissions++;

  // Gọi judge service
  try {
    const axios = require('axios');
    axios.post('http://localhost:5001/judge', {
      submissionId: submission._id,
      language,
      code,
      testCases: problem.testCases,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    }).catch(err => console.error('Judge error:', err.message));
  } catch (error) {
    console.error('Error calling judge:', error.message);
  }

  res.status(201).json({ success: true, submission });
});

app.get('/api/submissions', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userId = token?.replace('demo-token-', '');

  const userSubmissions = submissions.filter(s => s.user._id === userId);

  res.json({
    success: true,
    submissions: userSubmissions,
    totalPages: 1,
    currentPage: 1,
    total: userSubmissions.length,
  });
});

app.get('/api/submissions/:id', (req, res) => {
  const submission = submissions.find(s => s._id === req.params.id);
  
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy submission' });
  }

  res.json({ success: true, submission });
});

app.patch('/api/submissions/:id/status', (req, res) => {
  const { status, errorMessage } = req.body;
  const submission = submissions.find(s => s._id === req.params.id);

  if (!submission) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy submission' });
  }

  submission.status = status;
  submission.errorMessage = errorMessage || '';

  res.json({ success: true, submission });
});

app.patch('/api/submissions/:id/result', (req, res) => {
  const { status, testResults, executionTime, memoryUsed, score, errorMessage } = req.body;
  const submission = submissions.find(s => s._id === req.params.id);

  if (!submission) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy submission' });
  }

  submission.status = status;
  submission.testResults = testResults;
  submission.executionTime = executionTime;
  submission.memoryUsed = memoryUsed;
  submission.score = score;
  submission.errorMessage = errorMessage || '';

  // Cập nhật stats
  if (status === 'Accepted') {
    const problem = problems.find(p => p._id === submission.problem._id);
    const user = users.find(u => u._id === submission.user._id);
    
    if (problem) problem.acceptedCount++;
    if (user && !user.solvedProblems.includes(submission.problem._id)) {
      user.solvedProblems.push(submission.problem._id);
      user.acceptedSubmissions++;
    }
  }

  res.json({ success: true, submission });
});

// Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const sorted = [...users].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.acceptedSubmissions - a.acceptedSubmissions;
  });

  const leaderboard = sorted.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    fullName: user.fullName,
    rating: user.rating,
    solvedCount: user.solvedProblems.length,
    acceptedSubmissions: user.acceptedSubmissions,
    totalSubmissions: user.submissions,
  }));

  res.json({
    success: true,
    leaderboard,
    totalPages: 1,
    currentPage: 1,
    total: sorted.length,
  });
});

// User profile
app.get('/api/users/profile/:username', (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
  }

  const solvedProblems = user.solvedProblems.map(id => {
    const problem = problems.find(p => p._id === id);
    return problem ? { _id: problem._id, title: problem.title, slug: problem.slug, difficulty: problem.difficulty } : null;
  }).filter(Boolean);

  res.json({
    success: true,
    user: { ...user, solvedProblems },
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Lỗi server',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại port ${PORT} (In-Memory Mode - No Database Required)`);
  console.log(`📝 Sample problem loaded: "${sampleProblems[0].title}"`);
});

module.exports = app;
