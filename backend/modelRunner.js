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
  ]);

  py.stdout.on('data', (data) => {
    console.log('Model output:', data.toString());
  });
  py.stderr.on('data', (data) => {
    console.error('Model error:', data.toString());
  });
  py.on('close', (code) => {
    try {
      const result = fs.readFileSync(outputFile, 'utf-8');
      const json = JSON.parse(result);
      callback(null, json);
    } catch (err) {
      callback(err, null);
    }
    // Clean up temp files
    fs.unlinkSync(tmpFile);
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
  });
}

module.exports = { runModel };
