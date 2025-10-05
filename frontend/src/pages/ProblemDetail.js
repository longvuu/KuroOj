import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ProblemDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedInput, setCopiedInput] = useState(null);
  const [copiedOutput, setCopiedOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('testcase');

  const defaultCode = {
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Viết code của bạn ở đây
    
    return 0;
}`,
    python: `# Viết code của bạn ở đây

`,
  };

  const fetchProblem = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/problems/${slug}`);
      setProblem(res.data.problem);
    } catch (error) {
      console.error('Lỗi khi tải đề bài:', error);
    }
  }, [slug]);

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);

  useEffect(() => {
    setCode(defaultCode[language]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const copyToClipboard = async (text, type, index) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'input') {
        setCopiedInput(index);
        setTimeout(() => setCopiedInput(null), 2000);
      } else {
        setCopiedOutput(index);
        setTimeout(() => setCopiedOutput(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRunCode = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để chạy code!');
      return;
    }

    setRunning(true);
    setActiveTab('result');
    setTestResult(null);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/submissions/run',
        {
          problemId: problem._id,
          code,
          language,
          testCasesOnly: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setTestResult(res.data);
    } catch (error) {
      console.error('Lỗi khi chạy code:', error);
      setTestResult({
        status: 'Error',
        error: error.response?.data?.message || 'Có lỗi xảy ra khi chạy code',
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để nộp bài');
      return;
    }

    try {
      setSubmitting(true);
      setResult(null);
      setActiveTab('result');

      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/submissions',
        {
          problemId: problem._id,
          language,
          code,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      pollSubmissionResult(res.data.submission._id);
    } catch (error) {
      console.error('Lỗi khi nộp bài:', error);
      alert('Có lỗi xảy ra khi nộp bài');
      setSubmitting(false);
    }
  };

  const pollSubmissionResult = async (submissionId) => {
    const token = localStorage.getItem('token');
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/submissions/${submissionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const submission = res.data.submission;
        console.log('📊 Submission data:', submission);
        console.log('📊 Test Results:', submission.testResults);
        if (submission.status !== 'Pending' && submission.status !== 'Judging') {
          setResult(submission);
          setSubmitting(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra kết quả:', error);
        setSubmitting(false);
        clearInterval(interval);
      }
    }, 1000);
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Dễ' || difficulty === 'Easy') {
      return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
    } else if (difficulty === 'Trung bình' || difficulty === 'Medium') {
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
    } else {
      return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
    }
  };

  if (!problem) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-slate-200">Đang tải bài toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 overflow-hidden" style={{ paddingTop: '64px' }}>
      <div className="h-full flex">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 h-full bg-slate-800 border-r border-slate-700 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-4 flex-shrink-0">
            <h1 className="text-2xl font-bold text-white mb-3">{problem.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-md text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              {problem.tags && problem.tags.map((tag, idx) => (
                <span key={idx} className="px-2 py-1 bg-slate-700 text-slate-300 rounded-md text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="space-y-6 text-slate-200">
              {/* Description */}
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded"></span>
                  Mô tả
                </h2>
                <div className="text-slate-300 leading-relaxed prose-invert">
                  <ReactMarkdown>{problem.description}</ReactMarkdown>
                </div>
              </section>

              {/* Input */}
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-green-500 rounded"></span>
                  Input
                </h2>
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-300">
                  <ReactMarkdown>{problem.inputFormat}</ReactMarkdown>
                </div>
              </section>

              {/* Output */}
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-purple-500 rounded"></span>
                  Output
                </h2>
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-300">
                  <ReactMarkdown>{problem.outputFormat}</ReactMarkdown>
                </div>
              </section>

              {/* Constraints */}
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-orange-500 rounded"></span>
                  Constraints
                </h2>
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <code className="text-orange-400 text-sm">
                    <ReactMarkdown>{problem.constraints}</ReactMarkdown>
                  </code>
                </div>
              </section>

              {/* Examples */}
              {problem.examples && problem.examples.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-cyan-500 rounded"></span>
                    Examples
                  </h2>
                  <div className="space-y-4">
                    {problem.examples.map((example, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
                          <span className="text-white font-semibold">Example {idx + 1}</span>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="relative group">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-slate-400 font-semibold">Input:</div>
                              <button
                                onClick={() => copyToClipboard(example.input, 'input', idx)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs flex items-center gap-1"
                              >
                                {copiedInput === idx ? (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="bg-slate-950 border border-slate-700 rounded p-3 text-sm text-green-400 font-mono overflow-x-auto">{example.input}</pre>
                          </div>
                          <div className="relative group">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xs text-slate-400 font-semibold">Output:</div>
                              <button
                                onClick={() => copyToClipboard(example.output, 'output', idx)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs flex items-center gap-1"
                              >
                                {copiedOutput === idx ? (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="bg-slate-950 border border-slate-700 rounded p-3 text-sm text-blue-400 font-mono overflow-x-auto">{example.output}</pre>
                          </div>
                          {example.explanation && (
                            <div>
                              <div className="text-xs text-slate-400 mb-1 font-semibold">Explanation:</div>
                              <p className="text-sm text-slate-300">{example.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor & Results */}
        <div className="w-1/2 h-full flex flex-col bg-slate-900">
          {/* Editor Header */}
          <div className="bg-slate-800 border-b border-slate-700 p-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-medium"
                >
                  <option value="cpp">C++ 17</option>
                  <option value="python">Python 3</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={running || !user}
                  className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                    running || !user
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {running ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Run Code
                    </>
                  )}
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !user}
                  className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                    submitting || !user
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Submitting...
                    </>
                  ) : !user ? (
                    'Login to Submit'
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : 'python'}
              value={code}
              onChange={(value) => setCode(value)}
              theme={isDark ? 'vs-dark' : 'vs-light'}
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: true,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 4,
                renderLineHighlight: 'all',
                suggestOnTriggerCharacters: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* Bottom Panel - Test Cases & Results */}
          <div className="bg-slate-800 border-t border-slate-700" style={{ height: '35%' }}>
            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              <button
                onClick={() => setActiveTab('testcase')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'testcase'
                    ? 'text-white border-b-2 border-blue-500 bg-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                }`}
              >
                Testcase
              </button>
              <button
                onClick={() => setActiveTab('result')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'result'
                    ? 'text-white border-b-2 border-blue-500 bg-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                }`}
              >
                Test Result
              </button>
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto custom-scrollbar" style={{ height: 'calc(100% - 49px)' }}>
              {activeTab === 'testcase' && problem?.examples && (
                <div className="p-4 space-y-4">
                  {problem.examples.map((example, idx) => (
                    <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
                      <div className="text-xs text-slate-400 font-semibold mb-2">Case {idx + 1}</div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Input</div>
                          <pre className="bg-slate-950 border border-slate-700 rounded p-2 text-sm text-green-400 font-mono overflow-x-auto">{example.input}</pre>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Expected Output</div>
                          <pre className="bg-slate-950 border border-slate-700 rounded p-2 text-sm text-blue-400 font-mono overflow-x-auto">{example.output}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'result' && (
                <div className="p-4">
                  {!testResult && !result && (
                    <div className="text-center text-slate-400 py-8">
                      <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">Click "Run Code" to see test results</p>
                    </div>
                  )}

                  {(testResult || result) && (
                    <div className="space-y-3">
                      {/* Status */}
                      <div className={`rounded-lg p-4 ${
                        (testResult?.status || result?.status) === 'Accepted' 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                          : (testResult?.status || result?.status) === 'Wrong Answer'
                          ? 'bg-gradient-to-r from-red-600 to-rose-600'
                          : 'bg-gradient-to-r from-yellow-600 to-orange-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-white text-lg font-bold">{testResult?.status || result?.status}</h3>
                          {(testResult?.score !== undefined || result?.score !== undefined) && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">{testResult?.score || result?.score}</div>
                              <div className="text-xs text-white/80">points</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Error Message */}
                      {(testResult?.error || result?.error) && (
                        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                          <div className="text-xs font-semibold text-red-400 mb-2">ERROR</div>
                          <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap overflow-x-auto">{testResult?.error || result?.error}</pre>
                        </div>
                      )}

                      {/* Test Results */}
                      {(testResult?.testResults || result?.testResults) && (
                        <div>
                          <h4 className="text-white font-semibold mb-2 text-sm">
                            Passed: {(testResult?.testResults || result?.testResults).filter(t => t.passed).length}/{(testResult?.testResults || result?.testResults).length}
                          </h4>
                          <div className="space-y-2">
                            {(testResult?.testResults || result?.testResults).map((test, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg ${
                                  test.passed
                                    ? 'bg-green-900/30 border border-green-700'
                                    : 'bg-red-900/30 border border-red-700'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-white">Test Case {idx + 1}</span>
                                  <span className={`text-sm font-bold ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                                    {test.passed ? '✓ Passed' : '✗ Failed'}
                                  </span>
                                </div>
                                {!test.passed && test.expected && (
                                  <div className="text-xs space-y-1">
                                    <div>
                                      <span className="text-slate-400">Expected: </span>
                                      <span className="text-green-400 font-mono">{test.expected}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">Got: </span>
                                      <span className="text-red-400 font-mono">{test.output}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default ProblemDetail;
