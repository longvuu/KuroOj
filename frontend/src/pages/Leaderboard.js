import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/leaderboard');
      setLeaderboard(res.data.leaderboard);
    } catch (error) {
      console.error('Lỗi khi tải bảng xếp hạng:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-500 dark:text-yellow-400';
    if (rank === 2) return 'text-gray-400 dark:text-gray-300';
    if (rank === 3) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-600 dark:text-slate-400';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-500 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
          Bảng xếp hạng
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Top lập trình viên xuất sắc nhất
        </p>
      </div>

      {loading ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-12">
          <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-gray-600 dark:text-slate-400 text-lg">Đang tải bảng xếp hạng...</p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-700/50 border-b border-gray-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Hạng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Bài đã giải
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Tỉ lệ AC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {leaderboard.map((user, index) => (
                  <tr 
                    key={user.username} 
                    className={`hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors duration-150 ${
                      index < 3 ? 'bg-gradient-to-r from-amber-50/30 to-transparent dark:from-slate-700/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getRankColor(user.rank)}`}>
                          #{user.rank}
                        </span>
                        {getRankBadge(user.rank) && (
                          <span className="text-2xl">{getRankBadge(user.rank)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 text-white flex items-center justify-center font-bold text-lg mr-3 shadow-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-slate-100">{user.username}</div>
                          {user.fullName && (
                            <div className="text-sm text-gray-500 dark:text-slate-400">{user.fullName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        {user.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded-lg border border-green-200 dark:border-green-800">
                        {user.solvedCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2 max-w-[100px]">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                            style={{ 
                              width: user.totalSubmissions > 0 
                                ? `${Math.round((user.acceptedSubmissions / user.totalSubmissions) * 100)}%` 
                                : '0%' 
                            }}
                          ></div>
                        </div>
                        <span className="text-gray-700 dark:text-slate-300 font-medium text-sm min-w-[45px]">
                          {user.totalSubmissions > 0
                            ? `${Math.round((user.acceptedSubmissions / user.totalSubmissions) * 100)}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
