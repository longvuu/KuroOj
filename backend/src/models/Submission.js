const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  language: {
    type: String,
    enum: ['cpp', 'python'],
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Judging',
      'Accepted',
      'Wrong Answer',
      'Time Limit Exceeded',
      'Memory Limit Exceeded',
      'Runtime Error',
      'Compilation Error',
    ],
    default: 'Pending',
  },
  testResults: [{
    testCase: Number,
    passed: Boolean,
    status: String,
    executionTime: Number,
    memoryUsed: Number,
    expected: String,
    output: String,
  }],
  executionTime: {
    type: Number, // milliseconds
    default: 0,
  },
  memoryUsed: {
    type: Number, // KB
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  errorMessage: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Index để tìm kiếm nhanh
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ problem: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
