import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/users/profile/${username}`);
      setUser(res.data.user);
    } catch (error) {
      console.error('Lỗi khi tải profile:', error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-12">
          <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-gray-600 dark:text-slate-400 text-lg">Đang tải profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-12">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Không tìm thấy người dùng</h3>
            <p className="text-gray-600 dark:text-slate-400">Username này không tồn tại trong hệ thống</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 p-8 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-blue-100 dark:border-slate-700 mb-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10"></div>
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
          {/* Avatar */}
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 text-white flex items-center justify-center text-5xl font-bold shadow-xl">
              {user.username.charAt(0).toUpperCase()}
            </div>
            {/* Rating badge */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              ⭐ {user.rating}
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
              {user.username}
            </h1>
            {user.fullName && (
              <p className="text-gray-600 dark:text-slate-400 text-xl mb-3">{user.fullName}</p>
            )}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-4 py-2 bg-white dark:bg-slate-700 rounded-lg border border-blue-200 dark:border-slate-600 shadow-sm">
                <span className="text-gray-500 dark:text-slate-400 text-sm">Rating: </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{user.rating}</span>
              </span>
              <span className={`px-4 py-2 rounded-lg font-semibold shadow-sm ${
                user.role === 'admin' 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                  : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-600'
              }`}>
                {user.role === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Solved Problems */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-green-100 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-green-500 dark:bg-green-600 text-white flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl">✅</div>
          </div>
          <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
            {user.solvedProblems.length}
          </div>
          <div className="text-gray-600 dark:text-slate-400 font-medium">Bài đã giải</div>
        </div>

        {/* Accepted Submissions */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-blue-100 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {user.acceptedSubmissions}
          </div>
          <div className="text-gray-600 dark:text-slate-400 font-medium">Bài AC</div>
        </div>

        {/* Total Submissions */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-purple-100 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-purple-500 dark:bg-purple-600 text-white flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-3xl">📊</div>
          </div>
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {user.submissions}
          </div>
          <div className="text-gray-600 dark:text-slate-400 font-medium">Tổng số lần nộp</div>
          {user.submissions > 0 && (
            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-slate-700">
              <div className="text-sm text-gray-600 dark:text-slate-400">
                Tỉ lệ AC: <span className="font-bold text-purple-600 dark:text-purple-400">
                  {Math.round((user.acceptedSubmissions / user.submissions) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Solved Problems Section */}
      {user.solvedProblems.length > 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 p-8 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Bài đã giải ({user.solvedProblems.length})
            </h2>
            <div className="text-2xl">🏆</div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.solvedProblems.map((problem) => (
              <div 
                key={problem._id} 
                className="bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-200 hover:scale-105 group"
              >
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {problem.title}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                    problem.difficulty === 'Dễ'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                      : problem.difficulty === 'Trung bình'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {problem.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 p-12 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
              Chưa giải bài nào
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-4">
              Bắt đầu luyện tập để xuất hiện trong danh sách này!
            </p>
            <a 
              href="/problems" 
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Xem đề bài
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
