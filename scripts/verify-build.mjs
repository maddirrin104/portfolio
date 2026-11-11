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
  assert(/^(index\.html|404\.html|about\/index\.html|favicon\.svg|robots\.txt|font-license\.txt|SHA256SUMS|icons\/(github-invertocat-white\.svg|linkedin-in-white\.png)|images\/(ccdl1-(badge|certificate)\.webp|portrait\.webp|technologies\/python\.svg)|resume\/Vo-Minh-An-Resume\.pdf|projects\/(soc-homelab|egis)\/index\.html|_astro\/[\w.-]+\.(css|woff2))$/.test(name), `Unreviewed build asset: ${name}`);
}
for (const required of ['index.html', '404.html', 'about/index.html', 'favicon.svg', 'robots.txt', 'icons/github-invertocat-white.svg', 'icons/linkedin-in-white.png', 'images/ccdl1-badge.webp', 'images/ccdl1-certificate.webp', 'images/portrait.webp', 'images/technologies/python.svg', 'resume/Vo-Minh-An-Resume.pdf', 'projects/soc-homelab/index.html', 'projects/egis/index.html']) {
  assert(names.includes(required), `Missing output: ${required}`);
}

const homepage = await readFile(new URL('index.html', root), 'utf8');
const resumePath = 'resume/Vo-Minh-An-Resume.pdf';
const resumeBytes = await readFile(new URL(resumePath, root));
assert(resumeBytes.subarray(0, 5).toString() === '%PDF-', 'Resume asset must be a PDF');
assert(homepage.includes(`href="/${resumePath}"`) && homepage.includes('target="_blank"') && homepage.includes('rel="noopener noreferrer"'), 'View resume link missing or unsafe');
const aboutPage = await readFile(new URL('about/index.html', root), 'utf8');
assert(aboutPage.includes(`href="/${resumePath}"`) && aboutPage.includes('download="Vo-Minh-An-Resume.pdf"'), 'Download resume link missing or misnamed');
assert.equal((homepage.match(/<h1\b/g) ?? []).length, 1, 'Homepage must have one h1');
assert(homepage.includes('lang="en"'), 'Homepage language must be English');
assert(homepage.includes('noindex, nofollow'), 'Local review build must remain noindex');
for (const id of ['main', 'projects', 'about', 'contact']) {
  assert(homepage.includes(`id="${id}"`), `Missing section ${id}`);
}
const allowedHosts = new Set(['github.com', 'linkedin.com']);
for (const file of files.filter(file => file.pathname.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const inlineScripts = [...html.matchAll(/<script\b[^>]*>(.*?)<\/script>/gs)];
  assert.equal(inlineScripts.filter(([tag]) => tag.includes('data-theme-bootstrap')).length, 1, 'Early theme bootstrap missing or duplicated');
  assert(inlineScripts.some(([tag]) => tag.includes('data-theme-bootstrap') && tag.includes('localStorage') && tag.includes('matchMedia')), 'Theme persistence or system mode missing');
  assert(html.indexOf('data-theme-bootstrap') < html.indexOf('rel="stylesheet"'), 'Theme bootstrap must precede the stylesheet');
  if (file.pathname.endsWith('/about/index.html')) {
    assert.equal(inlineScripts.length, 2, 'Only theme and certificate scripts are allowed on About');
    assert(inlineScripts.some(([, body]) => body.includes('showModal()')), 'Certificate preview script missing from About');
  } else {
    assert.equal(inlineScripts.length, 1, 'Only the theme bootstrap is allowed outside About');
  }
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `Page must have one h1: ${file.pathname}`);
  assert(html.includes('noindex, nofollow'), 'Local review build must remain noindex');
  assert(!/mailto:|tel:|cv\.pdf|ccdl1-badge\.png|Snort 3 Inline|12 SPL|80 incidents|PRIVATE|CV_CLAIMED/i.test(html), 'Deferred or private content in HTML');
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
for (const file of files.filter(file => file.pathname.endsWith('.css'))) {
  const css = await readFile(file, 'utf8');
  for (const [, asset] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    assert(!/^(?:data:|https?:|\/\/)/i.test(asset), `Unexpected CSS asset URL: ${asset}`);
    const target = asset.startsWith('/') ? new URL(asset.slice(1), root) : new URL(asset, file);
    await stat(target);
  }
}
const size = (await Promise.all(files.map(async file => (await stat(file)).size))).reduce((sum, value) => sum + value, 0);
console.log(`PASS: ${names.length} allowlisted files, HTML/CSS assets, local links/anchors, English metadata, early theme bootstrap and certificate preview script. Total ${size} bytes.`);
