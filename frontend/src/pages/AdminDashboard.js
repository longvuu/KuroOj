import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProblems: 0,
    totalSubmissions: 0,
    todaySubmissions: 0,
    acceptedRate: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Kiểm tra quyền admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
    }
  }, [user, navigate]);

  // Lấy thống kê
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Lấy thống kê tổng quan
      const [usersRes, problemsRes, submissionsRes] = await Promise.all([
        axios.get(`${API_URL}/api/users`, config),
        axios.get(`${API_URL}/api/problems`, config),
        axios.get(`${API_URL}/api/submissions`, config)
      ]);

      const users = usersRes.data.users || usersRes.data;
      const problems = problemsRes.data.problems || problemsRes.data;
      const submissions = submissionsRes.data.submissions || submissionsRes.data;

      // Tính toán thống kê
      const today = new Date().setHours(0, 0, 0, 0);
      const todaySubmissions = submissions.filter(s => 
        new Date(s.createdAt).setHours(0, 0, 0, 0) === today
      );
      
      const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted');
      const acceptedRate = submissions.length > 0 
        ? ((acceptedSubmissions.length / submissions.length) * 100).toFixed(1)
        : 0;

      setStats({
        totalUsers: users.length,
        totalProblems: problems.length,
        totalSubmissions: submissions.length,
        todaySubmissions: todaySubmissions.length,
        acceptedRate
      });

      // Recent users (5 người mới nhất)
      setRecentUsers(users.slice(-5).reverse());

      // Recent submissions (10 bài nộp mới nhất)
      setRecentSubmissions(submissions.slice(-10).reverse());

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Accepted': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'Wrong Answer': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      'Time Limit Exceeded': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'Runtime Error': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      'Compilation Error': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      'Pending': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      'Judging': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-900 dark:text-slate-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            🎛️ Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Quản lý và theo dõi hệ thống KuroOJ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-blue-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">Tổng người dùng</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">{stats.totalUsers}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-green-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">Tổng bài toán</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">{stats.totalProblems}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-purple-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">Tổng bài nộp</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">{stats.totalSubmissions}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-yellow-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">Nộp hôm nay</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">{stats.todaySubmissions}</p>
              </div>
              <div className="text-4xl">🔥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-red-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">Tỷ lệ AC</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">{stats.acceptedRate}%</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                📊 Tổng quan
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                👥 Người dùng
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`${
                  activeTab === 'submissions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                📝 Bài nộp
              </button>
              <button
                onClick={() => navigate('/admin/problems')}
                className="border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
              >
                ⚙️ Quản lý bài toán
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700 rounded-t-xl">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">👥 Người dùng mới</h2>
              </div>
              <div className="p-6">
                {recentUsers.length === 0 ? (
                  <p className="text-gray-500 dark:text-slate-400 text-center py-4">Chưa có người dùng nào</p>
                ) : (
                  <div className="space-y-4">
                    {recentUsers.map(user => (
                      <div key={user._id} className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 p-2 rounded transition-colors duration-200">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-slate-100">{user.fullName}</p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">@{user.username}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                              : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300'
                          }`}>
                            {user.role === 'admin' ? '🔴 Admin' : '👤 User'}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">⭐ {user.rating}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-700 rounded-t-xl">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">⚡ Thao tác nhanh</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/admin/problems/new')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                  >
                    ➕ Thêm bài toán
                  </button>
                  <button
                    onClick={() => navigate('/problems')}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                  >
                    📚 Xem bài toán
                  </button>
                  <button
                    onClick={() => navigate('/submissions')}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 dark:from-purple-600 dark:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                  >
                    📊 Xem bài nộp
                  </button>
                  <button
                    onClick={() => navigate('/leaderboard')}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 dark:from-yellow-600 dark:to-yellow-700 dark:hover:from-yellow-700 dark:hover:to-yellow-800 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                  >
                    🏆 Bảng xếp hạng
                  </button>
                  <button
                    onClick={fetchDashboardData}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 col-span-2"
                  >
                    🔄 Làm mới dữ liệu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">👥 Danh sách người dùng</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Đã giải
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {recentUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{user.fullName}</div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">@{user.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">⭐ {user.rating}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {user.solvedProblems?.length || 0} bài
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                            : 'bg-gray-100 dark:bg-slate-600 text-gray-800 dark:text-slate-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">📝 Bài nộp gần đây</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Bài toán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Ngôn ngữ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Ngày nộp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {recentSubmissions.map(submission => (
                    <tr key={submission._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-slate-400">
                        #{submission._id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                        {submission.user?.username || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                        {submission.problem?.title || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-600 dark:to-slate-700 text-gray-800 dark:text-slate-200">
                          {submission.language}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {submission.executionTime ? `⏱ ${submission.executionTime}ms` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {formatDate(submission.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
