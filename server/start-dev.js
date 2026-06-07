// savorsphere/start-dev.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define paths
const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

// Check if directories exist
if (!fs.existsSync(serverDir)) {
  console.error(`Server directory not found: ${serverDir}`);
  process.exit(1);
}

if (!fs.existsSync(clientDir)) {
  console.error(`Client directory not found: ${clientDir}`);
  process.exit(1);
}

// Function to start a process
function startProcess(command, args, cwd, name) {
  console.log(`Starting ${name}...`);
  
  const proc = spawn(command, args, {
    cwd,
    stdio: 'pipe',
    shell: true
  });
  
  proc.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });
  
  proc.stderr.on('data', (data) => {
    console.error(`[${name}] ${data.toString().trim()}`);
  });
  
  proc.on('close', (code) => {
    console.log(`${name} process exited with code ${code}`);
  });
  
  return proc;
}

// Start server
const serverProcess = startProcess(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['start'],
  serverDir,
  'SERVER'
);

// Start client
const clientProcess = startProcess(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['start'],
  clientDir,
  'CLIENT'
);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
});
