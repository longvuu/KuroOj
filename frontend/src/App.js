import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Submissions from './pages/Submissions';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminProblems from './pages/AdminProblems';
import ProblemForm from './pages/ProblemForm';
import VerifyEmail from './pages/VerifyEmail';

function AppContent() {
  const location = useLocation();
  const isProblemDetail = location.pathname.includes('/problems/') && location.pathname.split('/').length === 3;
  const isVerifyEmail = location.pathname.includes('/verify-email/');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {!isVerifyEmail && <Navbar />}
      {isProblemDetail ? (
        <Routes>
          <Route path="/problems/:slug" element={<ProblemDetail />} />
        </Routes>
      ) : isVerifyEmail ? (
        <Routes>
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Routes>
      ) : (
        <main className="container mx-auto px-4 py-8" style={{ paddingTop: 'calc(4rem + 64px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/:username" element={<Profile />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/problems" element={<AdminProblems />} />
            <Route path="/admin/problems/new" element={<ProblemForm />} />
            <Route path="/admin/problems/:id/edit" element={<ProblemForm />} />
          </Routes>
        </main>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
