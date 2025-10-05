import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ProblemForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Trung bình',
    timeLimit: 1000,
    memoryLimit: 256,
    tags: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    explanation: ''
  });

  const [testCases, setTestCases] = useState([
    { input: '', output: '', isSample: false }
  ]);

  const [autoGenConfig, setAutoGenConfig] = useState({
    count: 5,
    inputPattern: '',
    outputPattern: ''
  });

  const [showAutoGen, setShowAutoGen] = useState(false);

  const fetchProblem = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/problems/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const problem = response.data.problem || response.data;
      setFormData({
        title: problem.title || '',
        description: problem.description || '',
        difficulty: problem.difficulty || 'Trung bình',
        timeLimit: problem.timeLimit || 1000,
        memoryLimit: problem.memoryLimit || 256,
        tags: problem.tags?.join(', ') || '',
        inputFormat: problem.inputFormat || '',
        outputFormat: problem.outputFormat || '',
        constraints: problem.constraints || '',
        sampleInput: problem.sampleInput || '',
        sampleOutput: problem.sampleOutput || '',
        explanation: problem.explanation || ''
      });

      if (problem.testCases && problem.testCases.length > 0) {
        setTestCases(problem.testCases);
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      alert('Lỗi khi tải bài toán: ' + (error.response?.data?.message || error.message));
    }
  }, [id]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
    }

    if (isEditMode) {
      fetchProblem();
    }
  }, [user, navigate, isEditMode, fetchProblem]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', output: '', isSample: false }]);
  };

  const removeTestCase = (index) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  };

  const generateRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateRandomArray = (length, min, max) => {
    return Array.from({ length }, () => generateRandomInt(min, max));
  };

  const autoGenerateTestCases = () => {
    const { count, inputPattern, outputPattern } = autoGenConfig;
    
    if (!inputPattern.trim()) {
      alert('⚠️ Vui lòng nhập pattern cho input!');
      return;
    }

    const newTestCases = [];
    
    for (let i = 0; i < count; i++) {
      try {
        // Parse input pattern
        // Format: n=1..100, arr=n[1..10]
        let input = '';
        const patterns = inputPattern.split(',').map(p => p.trim());
        const variables = {};
        
        patterns.forEach(pattern => {
          if (pattern.includes('=')) {
            const [varName, range] = pattern.split('=').map(s => s.trim());
            
            // Single number range: n=1..100
            if (range.match(/^\d+\.\.\d+$/)) {
              const [min, max] = range.split('..').map(Number);
              variables[varName] = generateRandomInt(min, max);
              input += variables[varName] + '\n';
            }
            // Array: arr=n[1..10] means array of n elements, each 1..10
            else if (range.match(/^(\w+)\[(\d+)\.\.(\d+)\]$/)) {
              const match = range.match(/^(\w+)\[(\d+)\.\.(\d+)\]$/);
              const lengthVar = match[1];
              const min = parseInt(match[2]);
              const max = parseInt(match[3]);
              const length = variables[lengthVar] || 5;
              const arr = generateRandomArray(length, min, max);
              variables[varName] = arr;
              input += arr.join(' ') + '\n';
            }
            // Fixed array length: arr=5[1..10]
            else if (range.match(/^(\d+)\[(\d+)\.\.(\d+)\]$/)) {
              const match = range.match(/^(\d+)\[(\d+)\.\.(\d+)\]$/);
              const length = parseInt(match[1]);
              const min = parseInt(match[2]);
              const max = parseInt(match[3]);
              const arr = generateRandomArray(length, min, max);
              variables[varName] = arr;
              input += arr.join(' ') + '\n';
            }
          }
        });

        // Generate output based on pattern
        let output = '';
        if (outputPattern.trim()) {
          // Simple patterns
          if (outputPattern === 'sum(arr)') {
            output = variables.arr ? variables.arr.reduce((a, b) => a + b, 0).toString() : '0';
          } else if (outputPattern === 'max(arr)') {
            output = variables.arr ? Math.max(...variables.arr).toString() : '0';
          } else if (outputPattern === 'min(arr)') {
            output = variables.arr ? Math.min(...variables.arr).toString() : '0';
          } else if (outputPattern === 'n*2') {
            output = variables.n ? (variables.n * 2).toString() : '0';
          } else if (outputPattern === 'n+m') {
            output = (variables.n || 0) + (variables.m || 0);
            output = output.toString();
          } else if (outputPattern.match(/^eval\((.*)\)$/)) {
            // Custom eval pattern: eval(n*m+5)
            const expr = outputPattern.match(/^eval\((.*)\)$/)[1];
            let evalExpr = expr;
            Object.keys(variables).forEach(key => {
              evalExpr = evalExpr.replace(new RegExp(`\\b${key}\\b`, 'g'), variables[key]);
            });
            try {
              // eslint-disable-next-line no-eval
              output = eval(evalExpr).toString();
            } catch (e) {
              output = '?';
            }
          } else {
            output = outputPattern; // Literal output
          }
        }

        newTestCases.push({
          input: input.trim(),
          output: output.trim(),
          isSample: false
        });
      } catch (error) {
        console.error('Error generating test case:', error);
      }
    }

    if (newTestCases.length > 0) {
      setTestCases([...testCases, ...newTestCases]);
      alert(`✅ Đã tạo ${newTestCases.length} test cases tự động!`);
      setShowAutoGen(false);
    }
  };

  const generateTemplateTestCases = (template) => {
    const templates = {
      'sum': {
        inputPattern: 'n=2..10, arr=n[1..100]',
        outputPattern: 'sum(arr)',
        count: 5
      },
      'max': {
        inputPattern: 'n=2..10, arr=n[1..100]',
        outputPattern: 'max(arr)',
        count: 5
      },
      'add': {
        inputPattern: 'a=1..1000, b=1..1000',
        outputPattern: 'eval(a+b)',
        count: 5
      },
      'multiply': {
        inputPattern: 'a=1..100, b=1..100',
        outputPattern: 'eval(a*b)',
        count: 5
      }
    };

    if (templates[template]) {
      setAutoGenConfig(templates[template]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const problemData = {
        title: formData.title,
        slug: slug,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: tagsArray,
        timeLimit: parseInt(formData.timeLimit),
        memoryLimit: parseInt(formData.memoryLimit),
        inputFormat: formData.inputFormat || 'Nhập dữ liệu theo yêu cầu',
        outputFormat: formData.outputFormat || 'Xuất kết quả theo yêu cầu',
        constraints: formData.constraints || 'Không có ràng buộc đặc biệt',
        examples: formData.sampleInput && formData.sampleOutput ? [{
          input: formData.sampleInput,
          output: formData.sampleOutput,
          explanation: formData.explanation || ''
        }] : [],
        testCases: testCases.filter(tc => tc.input && tc.output).map(tc => ({
          input: tc.input,
          output: tc.output,
          isHidden: !tc.isSample
        }))
      };

      if (isEditMode) {
        await axios.put(`${API_URL}/api/problems/${id}`, problemData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ Cập nhật bài toán thành công!');
      } else {
        await axios.post(`${API_URL}/api/problems`, problemData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ Thêm bài toán thành công!');
      }

      navigate('/admin/problems');
    } catch (error) {
      console.error('Error saving problem:', error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {isEditMode ? '✏️ Chỉnh sửa bài toán' : '➕ Thêm bài toán mới'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            {isEditMode ? 'Cập nhật thông tin bài toán' : 'Điền thông tin để tạo bài toán mới'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">📝 Thông tin cơ bản</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                  placeholder="Ví dụ: Tổng hai số"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Độ khó <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Time Limit (ms)
                  </label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleChange}
                    min="100"
                    max="10000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Memory Limit (MB)
                  </label>
                  <input
                    type="number"
                    name="memoryLimit"
                    value={formData.memoryLimit}
                    onChange={handleChange}
                    min="64"
                    max="1024"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Tags (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                  placeholder="Ví dụ: Array, Math, String"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                  placeholder="Mô tả chi tiết bài toán..."
                />
              </div>
            </div>
          </div>

          {/* Input/Output Format */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">📋 Định dạng Input/Output</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Input Format <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="inputFormat"
                    value={formData.inputFormat}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    placeholder="Mô tả định dạng input..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Output Format <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="outputFormat"
                    value={formData.outputFormat}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    placeholder="Mô tả định dạng output..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Constraints <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="constraints"
                  value={formData.constraints}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                  placeholder="Ví dụ: 1 ≤ n ≤ 10^5"
                />
              </div>
            </div>
          </div>

          {/* Sample Test Case */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">💡 Ví dụ mẫu</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Sample Input
                  </label>
                  <textarea
                    name="sampleInput"
                    value={formData.sampleInput}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    placeholder="Input mẫu..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Sample Output
                  </label>
                  <textarea
                    name="sampleOutput"
                    value={formData.sampleOutput}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                    placeholder="Output mẫu..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Giải thích
                </label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                  placeholder="Giải thích ví dụ mẫu..."
                />
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">🧪 Test Cases ({testCases.length})</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAutoGen(!showAutoGen)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                >
                  🤖 Auto Generate
                </button>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                >
                  ➕ Thêm Manual
                </button>
              </div>
            </div>

            {/* Auto Generator Panel */}
            {showAutoGen && (
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-700 rounded-lg border-2 border-purple-200 dark:border-purple-600">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">🤖 Tự động tạo Test Cases</h3>
                
                {/* Quick Templates */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Template nhanh:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => generateTemplateTestCases('sum')}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Tổng mảng
                    </button>
                    <button
                      type="button"
                      onClick={() => generateTemplateTestCases('max')}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Max mảng
                    </button>
                    <button
                      type="button"
                      onClick={() => generateTemplateTestCases('add')}
                      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Tổng 2 số
                    </button>
                    <button
                      type="button"
                      onClick={() => generateTemplateTestCases('multiply')}
                      className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Nhân 2 số
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Số test cases:
                    </label>
                    <input
                      type="number"
                      value={autoGenConfig.count}
                      onChange={(e) => setAutoGenConfig({...autoGenConfig, count: parseInt(e.target.value)})}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Input Pattern:
                    </label>
                    <input
                      type="text"
                      value={autoGenConfig.inputPattern}
                      onChange={(e) => setAutoGenConfig({...autoGenConfig, inputPattern: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Ví dụ: n=1..100, arr=n[1..1000]"
                    />
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Format: <code className="bg-gray-200 dark:bg-slate-900 px-1 rounded">n=1..100</code> (số từ 1-100), 
                      <code className="bg-gray-200 dark:bg-slate-900 px-1 rounded ml-1">arr=n[1..10]</code> (mảng n phần tử, mỗi phần tử 1-10)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Output Pattern:
                    </label>
                    <input
                      type="text"
                      value={autoGenConfig.outputPattern}
                      onChange={(e) => setAutoGenConfig({...autoGenConfig, outputPattern: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Ví dụ: sum(arr), max(arr), eval(a+b)"
                    />
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Hỗ trợ: <code className="bg-gray-200 dark:bg-slate-900 px-1 rounded">sum(arr)</code>, 
                      <code className="bg-gray-200 dark:bg-slate-900 px-1 rounded ml-1">max(arr)</code>, 
                      <code className="bg-gray-200 dark:bg-slate-900 px-1 rounded ml-1">min(arr)</code>, 
                      <code className="bg-gray-200 dark:bg-slate-900 px-1 rounded ml-1">eval(n*2+5)</code>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={autoGenerateTestCases}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      🚀 Tạo Test Cases
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAutoGen(false)}
                      className="px-4 py-2 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-700/50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100">Test Case #{index + 1}</h3>
                    {testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                      >
                        🗑️ Xóa
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Input
                      </label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        placeholder="Input..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Output
                      </label>
                      <textarea
                        value={testCase.output}
                        onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200"
                        placeholder="Output..."
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={testCase.isSample}
                        onChange={(e) => handleTestCaseChange(index, 'isSample', e.target.checked)}
                        className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-slate-300">Hiển thị trong ví dụ</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? '⏳ Đang xử lý...' : (isEditMode ? '💾 Cập nhật bài toán' : '✅ Tạo bài toán')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/problems')}
              className="px-6 py-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              ❌ Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProblemForm;
