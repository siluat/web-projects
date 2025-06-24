const { writeFileSync, chmodSync } = require('node:fs');
const { join } = require('node:path');

// Create launcher script content
const launcherScript = `#!/usr/bin/env node

const { spawn } = require('node:child_process');
const { join } = require('node:path');
const { platform } = require('node:os');

function main() {
  const currentPlatform = platform();
  const binaryName = \`noumenon-gleaner\${currentPlatform === 'win32' ? '.exe' : ''}\`;
  const binaryPath = join(__dirname, binaryName);

  try {
    const child = spawn(binaryPath, process.argv.slice(2), {
      stdio: 'inherit',
      windowsHide: false,
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
      } else {
        process.exit(code || 0);
      }
    });

    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        console.error(\`❌ Binary not found: \${binaryPath}\`);
        console.error('Make sure to run "pnpm build" first.');
      } else {
        console.error(\`❌ Failed to start binary: \${error.message}\`);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error(\`❌ Error: \${error.message}\`);
    process.exit(1);
  }
}

main();
`;

// Write launcher script
const launcherPath = join(__dirname, '..', 'bin', 'noumenon-gleaner.js');
writeFileSync(launcherPath, launcherScript);

// Make executable (Unix-like systems)
try {
  chmodSync(launcherPath, '755');
} catch (error) {
  // Windows doesn't need chmod, ignore error
}

console.log('✅ Created launcher script: bin/noumenon-gleaner.js');
