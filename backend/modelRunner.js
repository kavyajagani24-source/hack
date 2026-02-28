const { spawn } = require('child_process');

function runModel(csvData, callback) {
  // Write CSV data to a temp file
  const fs = require('fs');
  const path = require('path');
  const tmpFile = path.join(__dirname, 'input.csv');
  const outputFile = path.join(__dirname, 'output.json');
  fs.writeFileSync(tmpFile, csvData);

  // Run the Python model with correct arguments
  const py = spawn('python', [
    'C:\\Users\\acorp\\social_autopilot_v2 (1).py',
    '--csv', tmpFile,
    '--user', 'You',
    '--output', outputFile
  ], {
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
  });

  py.stdout.on('data', (data) => {
    console.log('Model stdout:', data.toString());
  });
  py.stderr.on('data', (data) => {
    console.error('Model stderr:', data.toString());
  });
  py.on('close', (code) => {
    console.log('Model process closed with code:', code);
    try {
      if (!fs.existsSync(outputFile)) {
        throw new Error(`Output file not created: ${outputFile}`);
      }
      const result = fs.readFileSync(outputFile, 'utf-8');
      console.log('Output file content:', result.substring(0, 500)); // Log first 500 chars
      const json = JSON.parse(result);
      console.log('Parsed JSON successfully');
      callback(null, json);
    } catch (err) {
      console.error('Error processing model output:', err);
      callback(err, null);
    }
    // Clean up temp files
    try {
      fs.unlinkSync(tmpFile);
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    } catch (e) {
      console.error('Error cleaning up temp files:', e);
    }
  });
}

module.exports = { runModel };
