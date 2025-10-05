const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const submissionQueue = require('../queue/submissionQueue');

// Chạy code (test only, không lưu submission)
exports.runCode = async (req, res) => {
  try {
    const { problemId, language, code, testCasesOnly } = req.body;

    // Kiểm tra bài toán có tồn tại
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài toán',
      });
    }

    // Chỉ lấy sample test cases (examples) nếu testCasesOnly = true
    let testCases = problem.testCases;
    if (testCasesOnly && problem.examples && problem.examples.length > 0) {
      testCases = problem.examples.map(ex => ({
        input: ex.input,
        output: ex.output.trim(),
      }));
    }

    // Nếu không có test cases, trả về lỗi
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bài toán không có test cases để chạy thử',
      });
    }

    // DEMO: Tạo kết quả giả lập (mock result)
    // TODO: Thay thế bằng judge service thật khi có Redis và Judge service
    const mockResult = {
      success: true,
      status: 'Accepted',
      score: 100,
      executionTime: Math.floor(Math.random() * 100) + 10,
      memoryUsed: Math.floor(Math.random() * 1024) + 512,
      testResults: testCases.map((tc, idx) => ({
        passed: true,
        testCase: idx + 1,
        expected: tc.output,
        output: tc.output,
      })),
    };

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return res.json(mockResult);

  } catch (error) {
    console.error('Error in runCode:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Có lỗi xảy ra khi chạy code' 
    });
  }
};

// Nộp bài
exports.createSubmission = async (req, res) => {
  try {
    const { problemId, language, code } = req.body;

    // Kiểm tra bài toán có tồn tại
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài toán',
      });
    }

    // Tạo submission
    const submission = await Submission.create({
      user: req.user.id,
      problem: problemId,
      language,
      code,
      status: 'Pending',
    });

    // TODO: Khi có Redis + Judge service, uncomment đoạn này
    // await submissionQueue.add('judge', {
    //   submissionId: submission._id,
    //   problemId: problem._id,
    //   language,
    //   code,
    //   testCases: problem.testCases,
    //   timeLimit: problem.timeLimit,
    //   memoryLimit: problem.memoryLimit,
    // });

    // DEMO: Mock judge result (không cần Redis)
    setTimeout(async () => {
      try {
        const mockResult = {
          status: 'Accepted',
          score: 100,
          executionTime: Math.floor(Math.random() * 100) + 10,
          memoryUsed: Math.floor(Math.random() * 1024) + 512,
          testResults: problem.testCases.map((tc, idx) => ({
            passed: true,
            testCase: idx + 1,
            expected: tc.output,
            output: tc.output,
            executionTime: Math.floor(Math.random() * 50) + 5,
            memoryUsed: Math.floor(Math.random() * 512) + 256,
          })),
        };

        await Submission.findByIdAndUpdate(submission._id, mockResult);
      } catch (err) {
        console.error('Mock judge error:', err);
      }
    }, 2000);

    // Cập nhật submission count
    await Problem.findByIdAndUpdate(problemId, { $inc: { submissionCount: 1 } });
    await User.findByIdAndUpdate(req.user.id, { $inc: { submissions: 1 } });

    res.status(201).json({
      success: true,
      submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách submissions
exports.getSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, problemId, userId, status } = req.query;

    const query = {};

    if (problemId) query.problem = problemId;
    if (userId) query.user = userId;
    if (status) query.status = status;

    // User thường chỉ xem được submission của mình
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    const submissions = await Submission.find(query)
      .populate('user', 'username')
      .populate('problem', 'title slug difficulty')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Submission.countDocuments(query);

    res.json({
      success: true,
      submissions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết submission
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('user', 'username')
      .populate('problem', 'title slug difficulty');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy submission',
      });
    }

    // Kiểm tra quyền xem
    if (req.user.role !== 'admin' && submission.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem submission này',
      });
    }

    res.json({
      success: true,
      submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
