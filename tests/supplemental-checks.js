async page => {
  await page.goto('http://127.0.0.1:4321');
  const contrast = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const token = name => styles.getPropertyValue('--color-' + name).trim();
    const luminance = hex => {
      let raw = hex.replace('#', '');
      if (raw.length === 3) raw = [...raw].map(x => x + x).join('');
      const c = raw.match(/.{2}/g).map(x => parseInt(x, 16) / 255)
        .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4);
      return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
    };
    return [['ink', 'canvas'], ['muted', 'canvas'], ['muted', 'surface'], ['accent', 'canvas'], ['deep', 'note'], ['canvas', 'accent'], ['canvas', 'deep'], ['on-deep', 'deep']].map(([foreground, background]) => {
      const [light, dark] = [luminance(token(foreground)), luminance(token(background))].sort((a, b) => b - a);
      const ratio = (light + .05) / (dark + .05);
      return { foreground, background, ratio: +ratio.toFixed(2), status: ratio >= 4.5 ? 'PASS' : 'FAIL' };
    });
  });
  if (contrast.some(pair => pair.status === 'FAIL')) throw new Error(JSON.stringify(contrast));

  await page.goto('http://127.0.0.1:4321');
  const keyboard = [];
  const count = await page.locator('a').count();
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Tab');
    keyboard.push(await page.evaluate(() => {
      const el = document.activeElement;
      const rect = el.getBoundingClientRect();
      return { name: el.textContent.trim(), tag: el.tagName, focus: getComputedStyle(el).outlineStyle, visible: rect.top >= 0 && rect.bottom <= innerHeight };
    }));
  }
  if (keyboard.some(item => item.tag !== 'A' || item.focus === 'none' || !item.visible)) throw new Error(JSON.stringify(keyboard));

  const dev = [];
  for (const path of ['/', '/cv.pdf', '/ccdl1-badge.png', '/public/cv.pdf', '/docs/FACTS.md', '/@fs/D:/portfolio/public/cv.pdf', '/@fs/D:/portfolio/docs/FACTS.md']) {
    const response = await page.request.get('http://127.0.0.1:4322' + path);
    const status = response.status();
    const pass = path === '/' ? status === 200 : [403, 404].includes(status);
    dev.push({ path, http: status, status: pass ? 'PASS' : 'FAIL' });
    if (!pass) throw new Error(JSON.stringify(dev));
  }
  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(resource => ({ name: resource.name.split('/').pop(), bytes: resource.transferSize })));
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('http://127.0.0.1:4321');
  await page.screenshot({ path: 'artifacts/task-01/tablet-viewport.png' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: 'artifacts/task-01/mobile-viewport.png' });
  return { contrast, keyboard, dev, resources };
}
