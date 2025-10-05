const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

const TEMP_DIR = path.join(__dirname, '../../temp');

// Đảm bảo thư mục temp tồn tại
fs.ensureDirSync(TEMP_DIR);

exports.executeCode = async ({ language, code, input, expectedOutput, timeLimit, memoryLimit }) => {
  const workDir = path.join(TEMP_DIR, uuidv4());
  
  try {
    await fs.ensureDir(workDir);

    let result;
    if (language === 'cpp') {
      result = await executeCpp(code, input, workDir, timeLimit, memoryLimit);
    } else if (language === 'python') {
      result = await executePython(code, input, workDir, timeLimit, memoryLimit);
    } else {
      throw new Error('Ngôn ngữ không được hỗ trợ');
    }

    // So sánh output
    const actualOutput = result.output.trim();
    const expected = expectedOutput.trim();

    if (actualOutput === expected) {
      result.status = 'Accepted';
    } else {
      result.status = 'Wrong Answer';
    }

    return result;
  } catch (error) {
    return {
      status: error.message.includes('timeout') ? 'Time Limit Exceeded' : 'Runtime Error',
      executionTime: 0,
      memoryUsed: 0,
      output: '',
      error: error.message,
    };
  } finally {
    // Xóa thư mục tạm
    await fs.remove(workDir);
  }
};

async function executeCpp(code, input, workDir, timeLimit, memoryLimit) {
  const sourceFile = path.join(workDir, 'main.cpp');
  const execFile = path.join(workDir, 'main.exe');
  const inputFile = path.join(workDir, 'input.txt');

  // Ghi file
  await fs.writeFile(sourceFile, code);
  await fs.writeFile(inputFile, input);

  // Compile
  try {
    await execPromise(`g++ -o "${execFile}" "${sourceFile}" -std=c++17 -O2`, {
      timeout: 10000,
    });
  } catch (error) {
    throw new Error('Compilation Error: ' + error.stderr);
  }

  // Execute
  const startTime = Date.now();
  try {
    const { stdout, stderr } = await execPromise(
      `"${execFile}" < "${inputFile}"`,
      {
        timeout: timeLimit,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      }
    );
    
    const executionTime = Date.now() - startTime;

    return {
      output: stdout,
      executionTime,
      memoryUsed: 0, // Cần implement riêng để đo memory
      status: 'Running',
    };
  } catch (error) {
    if (error.killed) {
      throw new Error('timeout');
    }
    throw new Error(error.stderr || error.message);
  }
}

async function executePython(code, input, workDir, timeLimit, memoryLimit) {
  const sourceFile = path.join(workDir, 'main.py');
  const inputFile = path.join(workDir, 'input.txt');

  // Ghi file
  await fs.writeFile(sourceFile, code);
  await fs.writeFile(inputFile, input);

  // Execute
  const startTime = Date.now();
  try {
    const { stdout, stderr } = await execPromise(
      `python "${sourceFile}" < "${inputFile}"`,
      {
        timeout: timeLimit,
        maxBuffer: 10 * 1024 * 1024,
      }
    );
    
    const executionTime = Date.now() - startTime;

    if (stderr) {
      throw new Error(stderr);
    }

    return {
      output: stdout,
      executionTime,
      memoryUsed: 0,
      status: 'Running',
    };
  } catch (error) {
    if (error.killed) {
      throw new Error('timeout');
    }
    throw new Error(error.stderr || error.message);
  }
}
