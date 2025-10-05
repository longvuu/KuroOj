const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { executeCode } = require('../executors/codeExecutor');

exports.judgeSubmission = async (req, res) => {
  const { submissionId, language, code, testCases, timeLimit, memoryLimit } = req.body;

  console.log(`🔨 Bắt đầu chấm submission ${submissionId}`);

  try {
    // Cập nhật status sang "Judging"
    await updateSubmissionStatus(submissionId, 'Judging');

    const results = [];
    let totalTime = 0;
    let maxMemory = 0;
    let allPassed = true;
    let status = 'Accepted';
    let errorMessage = '';

    // Chạy từng test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      console.log(`  📝 Test case ${i + 1}/${testCases.length}`);

      try {
        const result = await executeCode({
          language,
          code,
          input: testCase.input,
          expectedOutput: testCase.output,
          timeLimit,
          memoryLimit,
        });

        results.push({
          testCase: i + 1,
          status: result.status,
          executionTime: result.executionTime,
          memoryUsed: result.memoryUsed,
          output: result.output,
        });

        totalTime += result.executionTime;
        maxMemory = Math.max(maxMemory, result.memoryUsed);

        if (result.status !== 'Accepted') {
          allPassed = false;
          status = result.status;
          if (result.error) {
            errorMessage = result.error;
          }
        }
      } catch (error) {
        console.error(`  ❌ Lỗi test case ${i + 1}:`, error.message);
        results.push({
          testCase: i + 1,
          status: 'Runtime Error',
          executionTime: 0,
          memoryUsed: 0,
          output: '',
        });
        allPassed = false;
        status = 'Runtime Error';
        errorMessage = error.message;
      }

      // Nếu đã fail thì dừng luôn (tùy chọn)
      // if (!allPassed) break;
    }

    // Tính điểm
    const passedTests = results.filter(r => r.status === 'Accepted').length;
    const score = Math.round((passedTests / testCases.length) * 100);

    // Cập nhật kết quả vào database
    await updateSubmissionResult(submissionId, {
      status,
      testResults: results,
      executionTime: totalTime,
      memoryUsed: maxMemory,
      score,
      errorMessage,
    });

    console.log(`✅ Hoàn thành chấm submission ${submissionId} - ${status}`);

    res.json({
      success: true,
      status,
      testResults: results,
      score,
    });
  } catch (error) {
    console.error(`❌ Lỗi khi chấm submission ${submissionId}:`, error.message);
    
    await updateSubmissionStatus(submissionId, 'Runtime Error', error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function để cập nhật status
async function updateSubmissionStatus(submissionId, status, errorMessage = '') {
  try {
    await axios.patch(`${process.env.BACKEND_URL}/api/submissions/${submissionId}/status`, {
      status,
      errorMessage,
    });
  } catch (error) {
    console.error('Lỗi cập nhật status:', error.message);
  }
}

// Helper function để cập nhật kết quả
async function updateSubmissionResult(submissionId, data) {
  try {
    await axios.patch(`${process.env.BACKEND_URL}/api/submissions/${submissionId}/result`, data);
  } catch (error) {
    console.error('Lỗi cập nhật kết quả:', error.message);
  }
}
