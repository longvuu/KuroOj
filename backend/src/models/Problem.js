const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề bài toán'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả bài toán'],
  },
  inputFormat: {
    type: String,
    required: true,
  },
  outputFormat: {
    type: String,
    required: true,
  },
  constraints: {
    type: String,
    required: true,
  },
  examples: [{
    input: String,
    output: String,
    explanation: String,
  }],
  testCases: [testCaseSchema],
  difficulty: {
    type: String,
    enum: ['Dễ', 'Trung bình', 'Khó'],
    default: 'Trung bình',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  timeLimit: {
    type: Number,
    default: 1000, // milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 256, // MB
  },
  acceptedCount: {
    type: Number,
    default: 0,
  },
  submissionCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index cho tìm kiếm
problemSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Problem', problemSchema);
