import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function javascriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? javascriptFiles(path) : path.endsWith('.js') ? [path] : [];
  });
}

const target = process.argv[2];
if (!['cloudflare', 'node'].includes(target)) throw new Error('Expected cloudflare or node target.');
const sources = javascriptFiles('dist/server').map(path => readFileSync(path, 'utf8'));
const required = target === 'node' ? 'node:sqlite' : 'cloudflare:workers';
const forbidden = target === 'node' ? 'cloudflare:workers' : 'node:sqlite';
if (!sources.some(source => source.includes(required)) || sources.some(source => source.includes(forbidden))) {
  throw new Error(`The ${target} build contains the wrong platform adapter.`);
}
console.log(`${target} runtime adapter verified.`);
