import { readdir, readFile, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../dist/', import.meta.url);
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    return entry.isDirectory() ? walk(path) : path;
  }))).flat();
}

const files = await walk(root);
const names = files.map(file => decodeURIComponent(file.pathname.slice(root.pathname.length)));
for (const name of names) {
  assert(/^(index\.html|404\.html|favicon\.svg|robots\.txt|font-license\.txt|_astro\/[\w.-]+\.(css|woff2))$/.test(name), `Unreviewed build asset: ${name}`);
}
for (const required of ['index.html', '404.html', 'favicon.svg', 'robots.txt']) {
  assert(names.includes(required), `Missing output: ${required}`);
}

const homepage = await readFile(new URL('index.html', root), 'utf8');
assert.equal((homepage.match(/<h1\b/g) ?? []).length, 1, 'Homepage must have one h1');
assert(homepage.includes('lang="en"'), 'Homepage language must be English');
assert(homepage.includes('noindex, nofollow'), 'Local review build must remain noindex');
for (const id of ['main', 'projects', 'about', 'contact']) {
  assert(homepage.includes(`id="${id}"`), `Missing section ${id}`);
}
const allowedHosts = new Set(['github.com', 'linkedin.com']);
for (const file of files.filter(file => file.pathname.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  assert(!/<script\b/i.test(html), 'MVP should work without client JavaScript');
  assert(!/mailto:|tel:|cv\.pdf|ccdl1-badge|Snort 3 Inline|12 SPL|80 incidents|PRIVATE|CV_CLAIMED/i.test(html), 'Deferred or private content in HTML');
  assert(!/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(html), 'IP address in output');
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (href.startsWith('https://')) {
      assert(allowedHosts.has(new URL(href).hostname), `Unreviewed external host: ${href}`);
      continue;
    }
    assert(!/^(?:javascript:|data:|http:)/i.test(href), `Unexpected URL: ${href}`);
    const [path, hash] = href.split('#');
    const target = path ? new URL(path.replace(/^\//, '') || 'index.html', root) : file;
    const resolved = target.pathname.endsWith('/') ? new URL('index.html', target) : target;
    await stat(resolved);
    if (hash) assert((await readFile(resolved, 'utf8')).includes(`id="${hash}"`), `Broken anchor: ${href}`);
  }
}
const size = (await Promise.all(files.map(async file => (await stat(file)).size))).reduce((sum, value) => sum + value, 0);
console.log(`PASS: ${names.length} allowlisted files, local links/anchors, English metadata, private-content exclusions, no client JS. Total ${size} bytes.`);
