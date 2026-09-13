import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

function readRequired(path) {
  const absolute = resolve(path);
  assert.equal(existsSync(absolute), true, `${path} should exist`);
  return readFileSync(absolute, 'utf8');
}

function collectTextFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? collectTextFiles(path) : [path];
  });
}

test('API route proxies the configured FastAPI report endpoint', () => {
  const source = readRequired('app/api/report/route.js');
  assert.match(source, /BACKEND_API_URL/);
  assert.match(source, /\/api\/report/);
  assert.match(source, /no-store/);
});

test('dashboard uses Hugeicons and includes the core report experience', () => {
  const dashboard = readRequired('components/Dashboard.jsx');
  assert.match(dashboard, /@hugeicons\/react/);
  assert.match(dashboard, /Report Overview/);
  assert.match(dashboard, /Search customers/);
  assert.match(dashboard, /refresh/i);
});

test('application source avoids the prohibited UI word', () => {
  const files = [...collectTextFiles('app'), ...collectTextFiles('components')];
  assert.ok(files.length > 0, 'application source files should exist');
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /premium/i, `${file} contains prohibited copy`);
  }
});

test('global styles include responsive breakpoints and focus-visible treatment', () => {
  const css = readRequired('app/globals.css');
  assert.match(css, /@media/);
  assert.match(css, /focus-visible/);
});
