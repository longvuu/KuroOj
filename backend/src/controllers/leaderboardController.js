const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const users = await User.find()
      .select('username fullName rating solvedProblems acceptedSubmissions submissions avatar')
      .sort({ rating: -1, acceptedSubmissions: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments();

    const leaderboard = users.map((user, index) => ({
      rank: (page - 1) * limit + index + 1,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      rating: user.rating,
      solvedCount: user.solvedProblems.length,
      acceptedSubmissions: user.acceptedSubmissions,
      totalSubmissions: user.submissions,
    }));

    res.json({
      success: true,
      leaderboard,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
