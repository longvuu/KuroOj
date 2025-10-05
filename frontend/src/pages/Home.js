import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-4">
          Chào mừng đến với KuroOJ
        </h1>
        <p className="text-xl text-gray-600 dark:text-slate-400 mb-8">
          Nền tảng luyện tập giải thuật toán tiếng Việt
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/problems"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 text-white rounded-lg text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 dark:hover:shadow-blue-400/30 transition-all duration-200 transform hover:scale-105"
          >
            Bắt đầu luyện tập
          </Link>
          <Link
            to="/leaderboard"
            className="px-8 py-3 bg-white dark:bg-slate-800 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg text-lg font-semibold hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-200"
          >
            Xem bảng xếp hạng
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-blue-100 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-300 hover:scale-105">
          <div className="text-4xl mb-4">💻</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-slate-100">Đa ngôn ngữ</h3>
          <p className="text-gray-600 dark:text-slate-400">
            Hỗ trợ C++ và Python với trình chấm bài tự động chính xác
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-purple-100 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-300 hover:scale-105">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-slate-100">Theo dõi tiến độ</h3>
          <p className="text-gray-600 dark:text-slate-400">
            Xem lịch sử nộp bài, thống kê và rating của bạn
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-amber-100 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-300 hover:scale-105">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-slate-100">Thi đấu</h3>
          <p className="text-gray-600 dark:text-slate-400">
            Cạnh tranh với các lập trình viên khác trên bảng xếp hạng
          </p>
        </div>
      </div>

      <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 p-8 rounded-xl shadow-lg dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Về KuroOJ
        </h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4 leading-relaxed">
          KuroOJ là một nền tảng Online Judge được thiết kế đặc biệt cho cộng đồng
          lập trình viên Việt Nam. Chúng tôi cung cấp một môi trường luyện tập
          giải thuật toán với giao diện thân thiện và hệ thống chấm bài nhanh chóng.
        </p>
        <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
          Dù bạn là người mới bắt đầu hay đã có kinh nghiệm, KuroOJ đều có những
          bài toán phù hợp để giúp bạn nâng cao kỹ năng lập trình và tư duy thuật toán.
        </p>
      </div>
    </div>
  );
};

export default Home;
