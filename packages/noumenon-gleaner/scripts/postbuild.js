#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binDir = path.join(__dirname, '..', 'bin');
const targetDir = path.join(__dirname, '..', 'target', 'release');

// Ensure bin directory exists
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

// Platform-specific executable names
const isWindows = os.platform() === 'win32';
const executableName = isWindows ? 'noumenon-gleaner.exe' : 'noumenon-gleaner';
const sourcePath = path.join(targetDir, executableName);
const targetPath = path.join(binDir, executableName);

// Copy the executable to bin directory
if (fs.existsSync(sourcePath)) {
  fs.copyFileSync(sourcePath, targetPath);

  // Make executable on Unix systems
  if (!isWindows) {
    fs.chmodSync(targetPath, '755');
  }

  console.log(`✓ Copied ${executableName} to bin/noumenon-gleaner`);
} else {
  console.error(`✗ Source executable not found: ${sourcePath}`);
  process.exit(1);
}

// Create Windows batch file for cmd compatibility
if (isWindows) {
  const batchContent = `@echo off
"%~dp0noumenon-gleaner.exe" %*
`;
  fs.writeFileSync(path.join(binDir, 'noumenon-gleaner.cmd'), batchContent);
  console.log('✓ Created Windows batch file: bin/noumenon-gleaner.cmd');
}
