import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    difficulty: '',
    search: '',
  });

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.difficulty) params.difficulty = filter.difficulty;
      if (filter.search) params.search = filter.search;

      const res = await axios.get('http://localhost:5000/api/problems', { params });
      setProblems(res.data.problems);
    } catch (error) {
      console.error('Lỗi khi tải đề bài:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Dễ':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800';
      case 'Trung bình':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800';
      case 'Khó':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-2">
          Danh sách đề bài
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Luyện tập với {problems.length} bài tập lập trình
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 mb-6 transition-all duration-300">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm đề bài..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>
          <select
            className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700/50 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all appearance-none cursor-pointer"
            value={filter.difficulty}
            onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
          >
            <option value="">Tất cả độ khó</option>
            <option value="Dễ">Dễ</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Khó">Khó</option>
          </select>
        </div>
      </div>

      {/* Problems Table */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-12">
          <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-gray-600 dark:text-slate-400 text-lg">Đang tải đề bài...</p>
          </div>
        </div>
      ) : problems.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 p-12">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">Không tìm thấy đề bài</h3>
            <p className="text-gray-600 dark:text-slate-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Độ khó
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Tỉ lệ AC
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                    Tags
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {problems.map((problem, index) => (
                  <tr 
                    key={problem._id} 
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/problems/${problem.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-base group-hover:underline transition-colors flex items-center gap-2"
                      >
                        <span className="text-gray-400 dark:text-slate-500 font-mono text-sm">#{index + 1}</span>
                        {problem.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold inline-flex items-center gap-1 ${getDifficultyColor(
                          problem.difficulty
                        )}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2 max-w-[100px]">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: problem.submissionCount > 0 
                                ? `${Math.round((problem.acceptedCount / problem.submissionCount) * 100)}%` 
                                : '0%' 
                            }}
                          ></div>
                        </div>
                        <span className="text-gray-700 dark:text-slate-300 font-medium text-sm min-w-[45px]">
                          {problem.submissionCount > 0
                            ? `${Math.round((problem.acceptedCount / problem.submissionCount) * 100)}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {problem.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-md border border-blue-200 dark:border-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 text-xs font-medium rounded-md">
                            +{problem.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Footer */}
      {!loading && problems.length > 0 && (
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-slate-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Dễ: {problems.filter(p => p.difficulty === 'Dễ').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Trung bình: {problems.filter(p => p.difficulty === 'Trung bình').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Khó: {problems.filter(p => p.difficulty === 'Khó').length}</span>
            </div>
          </div>
          <div>
            Tổng: <span className="font-semibold text-gray-900 dark:text-slate-100">{problems.length}</span> bài
          </div>
        </div>
      )}
    </div>
  );
};

export default Problems;
