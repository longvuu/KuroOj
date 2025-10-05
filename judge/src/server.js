const express = require('express');
const axios = require('axios');
require('dotenv').config();

const judgeController = require('./controllers/judgeController');

const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'KuroOJ Judge Service is running' });
});

// Judge endpoint
app.post('/judge', judgeController.judgeSubmission);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Lỗi judge service',
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🔨 Judge Service đang chạy tại port ${PORT}`);
});

module.exports = app;
