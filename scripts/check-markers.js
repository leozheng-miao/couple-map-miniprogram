const fs = require('fs');
const path = require('path');

const roots = ['miniprogram', 'cloudfunctions', 'README.md', 'docs'];
const skippedDirs = new Set(['.git', 'node_modules', '.worktrees', 'docs/superpowers']);
const pattern = /TO[D]O|TB[D]|待[定]|占[位]/;
const matches = [];

function shouldSkip(fullPath) {
  const normalized = fullPath.split(path.sep).join('/');
  return Array.from(skippedDirs).some((dir) => normalized.includes(`/${dir}/`) || normalized.endsWith(`/${dir}`));
}

function scanFile(fullPath) {
  const content = fs.readFileSync(fullPath, 'utf8');
  content.split(/\r?\n/).forEach((line, index) => {
    if (pattern.test(line)) {
      matches.push(`${fullPath}:${index + 1}:${line}`);
    }
  });
}

function walk(fullPath) {
  if (!fs.existsSync(fullPath) || shouldSkip(fullPath)) return;
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    fs.readdirSync(fullPath).forEach((name) => walk(path.join(fullPath, name)));
    return;
  }
  if (stat.isFile() && /\.(js|ts|json|wxml|wxss|md)$/.test(fullPath)) {
    scanFile(fullPath);
  }
}

roots.forEach((root) => walk(path.resolve(root)));

if (matches.length > 0) {
  console.error(matches.join('\n'));
  process.exit(1);
}

console.log('No unfinished markers found.');
