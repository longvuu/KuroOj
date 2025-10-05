import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Submissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/submissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data.submissions);
    } catch (error) {
      console.error('Lỗi khi tải submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800';
      case 'Wrong Answer':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800';
      case 'Time Limit Exceeded':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800';
      case 'Pending':
      case 'Judging':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return '✓';
      case 'Wrong Answer':
        return '✗';
      case 'Time Limit Exceeded':
        return '⏱';
      case 'Pending':
      case 'Judging':
        return '⟳';
      default:
        return '•';
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-12">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Cần đăng nhập</h3>
            <p className="text-gray-600 dark:text-slate-400">Vui lòng đăng nhập để xem lịch sử nộp bài</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
          Lịch sử nộp bài
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Theo dõi tất cả các bài nộp của bạn
        </p>
      </div>

      {loading ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-12">
          <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-gray-600 dark:text-slate-400 text-lg">Đang tải...</p>
          </div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-12">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Chưa có bài nộp</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-4">Bạn chưa nộp bài nào. Hãy bắt đầu luyện tập ngay!</p>
            <a href="/problems" className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
              Xem đề bài
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-700/50 border-b border-gray-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Bài toán
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Ngôn ngữ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Điểm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Nộp lúc
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {submissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-slate-100">{submission.problem.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800">
                        {submission.language.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 ${getStatusColor(submission.status)}`}>
                        <span>{getStatusIcon(submission.status)}</span>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-lg ${
                        submission.score === 100 
                          ? 'text-green-600 dark:text-green-400' 
                          : submission.score >= 50 
                          ? 'text-yellow-600 dark:text-yellow-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {submission.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700 dark:text-slate-300 font-medium">
                        {submission.executionTime}ms
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400 text-sm">
                      {new Date(submission.createdAt).toLocaleString('vi-VN')}
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

export default Submissions;
