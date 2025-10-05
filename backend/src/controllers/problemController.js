const Problem = require('../models/Problem');

// Lấy danh sách bài toán
exports.getProblems = async (req, res) => {
  try {
    const { page = 1, limit = 20, difficulty, tags, search } = req.query;

    const query = { isPublic: true };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const problems = await Problem.find(query)
      .select('-testCases')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Problem.countDocuments(query);

    res.json({
      success: true,
      problems,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết bài toán
exports.getProblem = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug })
      .select('-testCases')
      .populate('createdBy', 'username');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài toán',
      });
    }

    res.json({
      success: true,
      problem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo bài toán mới (Admin only)
exports.createProblem = async (req, res) => {
  try {
    const problemData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const problem = await Problem.create(problemData);

    res.status(201).json({
      success: true,
      problem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật bài toán (Admin only)
exports.updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài toán',
      });
    }

    res.json({
      success: true,
      problem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa bài toán (Admin only)
exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài toán',
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa bài toán',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
