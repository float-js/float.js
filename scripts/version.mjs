#!/usr/bin/env node

/**
 * Version management script for Float.js monorepo
 * 
 * Usage:
 *   node scripts/version.js <version>     - Set specific version
 *   node scripts/version.js patch         - Bump patch (x.x.X)
 *   node scripts/version.js minor         - Bump minor (x.X.0)
 *   node scripts/version.js major         - Bump major (X.0.0)
 * 
 * This will update all package.json files in the monorepo.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Packages to sync versions
const packages = [
  'package.json',
  'packages/core/package.json',
  'packages/create-float/package.json',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`Invalid version format: ${version}`);
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
  };
}

function bumpVersion(current, type) {
  const v = parseVersion(current);
  switch (type) {
    case 'major':
      return `${v.major + 1}.0.0`;
    case 'minor':
      return `${v.major}.${v.minor + 1}.0`;
    case 'patch':
      return `${v.major}.${v.minor}.${v.patch + 1}`;
    default:
      throw new Error(`Unknown bump type: ${type}`);
  }
}

function getCurrentVersion() {
  const rootPkg = readJson(path.join(rootDir, 'package.json'));
  return rootPkg.version;
}

function setVersion(newVersion) {
  console.log(`\n📦 Setting version to ${newVersion}\n`);
  
  for (const pkgPath of packages) {
    const fullPath = path.join(rootDir, pkgPath);
    const pkg = readJson(fullPath);
    const oldVersion = pkg.version;
    pkg.version = newVersion;
    writeJson(fullPath, pkg);
    console.log(`  ✓ ${pkgPath}: ${oldVersion} → ${newVersion}`);
  }
  
  console.log(`\n✅ All packages updated to v${newVersion}`);
  console.log('\nNext steps:');
  console.log('  git add -A');
  console.log(`  git commit -m "chore: bump version to ${newVersion}"`);
  console.log('  git push origin main');
}

// Main
const arg = process.argv[2];

if (!arg) {
  console.log('Usage:');
  console.log('  node scripts/version.js <version>  - Set specific version (e.g., 2.3.0)');
  console.log('  node scripts/version.js patch      - Bump patch version');
  console.log('  node scripts/version.js minor      - Bump minor version');
  console.log('  node scripts/version.js major      - Bump major version');
  console.log(`\nCurrent version: ${getCurrentVersion()}`);
  process.exit(0);
}

let newVersion;

if (['patch', 'minor', 'major'].includes(arg)) {
  const current = getCurrentVersion();
  newVersion = bumpVersion(current, arg);
} else if (/^\d+\.\d+\.\d+$/.test(arg)) {
  newVersion = arg;
} else {
  console.error(`❌ Invalid argument: ${arg}`);
  console.error('Use patch, minor, major, or a valid semver (e.g., 2.3.0)');
  process.exit(1);
}

setVersion(newVersion);
