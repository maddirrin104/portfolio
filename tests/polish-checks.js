async page => {
  const origin = 'http://127.0.0.1:4322';
  const routes = [
    ['home', '/'],
    ['soc', '/projects/soc-homelab/'],
    ['egis', '/projects/egis/'],
    ['profile', '/about/'],
  ];
  const results = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const check = (name, pass, detail) => {
    results.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
    if (!pass) throw new Error(JSON.stringify(results));
  };

  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : width === 768 ? 1024 : 900 });
    for (const [name, route] of routes) {
      const response = await page.goto(origin + route);
      await page.evaluate(() => document.fonts.ready);
      const view = await page.evaluate(() => ({
        width: innerWidth,
        document: document.documentElement.scrollWidth,
        h1: document.querySelectorAll('h1').length,
        navMinHeight: Math.min(...[...document.querySelectorAll('.nav-list a')].map(a => a.getBoundingClientRect().height)),
      }));
      check(`${name} ${width}px`, response.status() === 200 && view.document === width && view.h1 === 1 && view.navMinHeight >= 44, view);
      await page.screenshot({ path: `artifacts/task-04/after-${name}-${width}.png`, fullPage: true });
    }
  }

  await page.goto(origin + '/about/');
  const badge = await page.locator('.certification-image').evaluate(img => ({
    complete: img.complete,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    renderedWidth: img.getBoundingClientRect().width,
    renderedHeight: img.getBoundingClientRect().height,
    alt: img.alt,
    src: new URL(img.src).pathname,
    linked: !!img.closest('a'),
  }));
  check('Authentic badge loads without distortion', badge.complete && badge.naturalWidth === 560 && badge.naturalHeight === 560 && Math.abs(badge.renderedWidth - badge.renderedHeight) < 1 && badge.src === '/images/ccdl1-badge.webp' && badge.alt.includes('CCDL1') && !badge.linked, badge);
  const badgeResponse = await page.request.get(origin + '/images/ccdl1-badge.webp');
  check('Optimized badge asset', badgeResponse.status() === 200 && badgeResponse.headers()['content-type']?.includes('image/webp'), { status: badgeResponse.status(), type: badgeResponse.headers()['content-type'] });
  const rawResponse = await page.request.get(origin + '/public/images/certifications/ccdl1-badge.png');
  check('Original certificate excluded', rawResponse.status() === 404, rawResponse.status());
  check('No credential link', await page.getByRole('link', { name: /verify credential/i }).count() === 0);

  await page.setViewportSize({ width: 768, height: 1024 });
  for (const [name, route] of routes) {
    await page.goto(origin + route);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    check(`${name} 200% text`, await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
  }

  await page.goto(origin + '/about/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  check('Reduced motion navigation', await page.locator('.nav-list a').first().evaluate(a => getComputedStyle(a).transitionDuration === '0s'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.keyboard.press('Tab');
  check('Skip link visible on focus', await page.evaluate(() => document.activeElement.textContent === 'Skip to content' && document.activeElement.getBoundingClientRect().top >= 0));
  await page.keyboard.press('Enter');
  check('Skip link focus reaches main', await page.evaluate(() => document.activeElement.id === 'main'));

  check('No runtime errors', errors.length === 0, errors);
  return results;
}
