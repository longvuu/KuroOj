const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');

// Cập nhật status của submission (được gọi từ judge service)
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { status, errorMessage } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, errorMessage },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy submission',
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

// Cập nhật kết quả chi tiết của submission
exports.updateSubmissionResult = async (req, res) => {
  try {
    const { status, testResults, executionTime, memoryUsed, score, errorMessage } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { status, testResults, executionTime, memoryUsed, score, errorMessage },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy submission',
      });
    }

    // Nếu AC, cập nhật user và problem
    if (status === 'Accepted') {
      await Problem.findByIdAndUpdate(submission.problem, {
        $inc: { acceptedCount: 1 },
      });

      const user = await User.findById(submission.user);
      if (!user.solvedProblems.includes(submission.problem)) {
        await User.findByIdAndUpdate(submission.user, {
          $push: { solvedProblems: submission.problem },
          $inc: { acceptedSubmissions: 1 },
        });
      }
    }

    res.json({
      success: true,
      submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
