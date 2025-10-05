const Queue = require('bull');
const redis = require('redis');

// Tạo Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// Tạo queue cho việc chấm bài
const submissionQueue = new Queue('submission-queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

// Xử lý job chấm bài
submissionQueue.process('judge', async (job) => {
  const { submissionId, problemId, language, code, testCases, timeLimit, memoryLimit } = job.data;
  
  console.log(`⚡ Đang chấm submission ${submissionId}...`);
  
  try {
    // Gọi judge service để chấm bài
    const axios = require('axios');
    const response = await axios.post(`${process.env.JUDGE_SERVICE_URL}/judge`, {
      submissionId,
      language,
      code,
      testCases,
      timeLimit,
      memoryLimit,
    });

    console.log(`✅ Đã chấm xong submission ${submissionId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Lỗi khi chấm submission ${submissionId}:`, error.message);
    throw error;
  }
});

// Event listeners
submissionQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} đã hoàn thành`);
});

submissionQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} thất bại:`, err.message);
});

module.exports = submissionQueue;
