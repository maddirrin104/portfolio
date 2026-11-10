async page => {
  const results = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const check = (name, pass, detail) => {
    results.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
    if (!pass) throw new Error(JSON.stringify(results));
  };
  const origin = 'http://127.0.0.1:4321';
  const response = await page.goto(origin);
  check('Homepage HTTP', response.status() === 200, response.status());
  await page.evaluate(() => document.fonts.ready);

  for (const width of [320, 375, 390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    const measurements = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      overflowing: [...document.querySelectorAll('main *, header *, footer *')]
        .filter(el => el.getBoundingClientRect().right > innerWidth + 1 || el.getBoundingClientRect().left < -1)
        .map(el => el.tagName + '.' + el.className),
      h1: document.querySelector('h1').textContent,
      fonts: document.fonts.check('600 32px "Source Sans 3 Variable"'),
    }));
    check(`Reflow ${width}px`, measurements.document === width && !measurements.overflowing.length, measurements);
    if ([375, 768, 1440].includes(width)) await page.screenshot({ path: `artifacts/task-01/home-${width}.png`, fullPage: true });
  }

  await page.setViewportSize({ width: 375, height: 812 });
  for (const name of ['Projects', 'About', 'Contact']) {
    await page.getByRole('navigation').getByRole('link', { name, exact: true }).click();
    check(`Navigation ${name}`, page.url().endsWith('#' + name.toLowerCase()), page.url());
  }
  await page.goto(origin);
  await page.getByRole('link', { name: 'Explore my projects', exact: true }).click();
  check('Primary CTA', page.url().endsWith('#projects'), page.url());
  await page.getByRole('link', { name: 'A little about me', exact: true }).click();
  check('About CTA', page.url().endsWith('#about'), page.url());
  await page.getByRole('link', { name: 'Back to top', exact: true }).click();
  check('Back to top', page.url().endsWith('#main'), page.url());

  await page.goto(origin);
  await page.keyboard.press('Tab');
  const skip = await page.evaluate(() => ({
    text: document.activeElement.textContent,
    top: document.activeElement.getBoundingClientRect().top,
    outline: getComputedStyle(document.activeElement).outlineStyle,
  }));
  check('Keyboard skip link and focus', skip.text === 'Skip to content' && skip.top >= 0 && skip.outline !== 'none', skip);
  await page.keyboard.press('Enter');
  check('Skip target focus', await page.evaluate(() => document.activeElement.id === 'main'));
  await page.keyboard.press('Tab');
  check('Keyboard reaches primary CTA', await page.evaluate(() => document.activeElement.textContent.includes('Explore my projects')));
  await page.keyboard.press('Enter');
  check('Keyboard CTA activation', page.url().endsWith('#projects'));

  const links = await page.locator('a[href^="https:"]').evaluateAll(elements => elements.map(el => ({ name: el.getAttribute('aria-label') || el.textContent.trim(), href: el.href })));
  check('Real project and contact targets', links.length === 5 && links.some(link => link.href === 'https://linkedin.com/in/minhanvo104') && links.some(link => link.href === 'https://github.com/maddirrin104/soc-homelab'), links);
  const semantics = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    main: document.querySelectorAll('main').length,
    lang: document.documentElement.lang,
    unnamedLinks: [...document.querySelectorAll('a')].filter(a => !(a.textContent.trim() || a.getAttribute('aria-label'))).length,
    description: document.querySelector('meta[name="description"]')?.content,
  }));
  check('Semantics and metadata', semantics.h1 === 1 && semantics.main === 1 && semantics.lang === 'en' && !semantics.unnamedLinks && !!semantics.description, semantics);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  check('Reduced motion', await page.locator('.button-primary').evaluate(el => getComputedStyle(el).transitionDuration === '0s'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await page.goto(origin);
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  check('200% text resize', await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  await page.screenshot({ path: 'artifacts/task-01/text-200-percent.png', fullPage: true });
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });

  const noJs = await page.context().browser().newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(origin);
  await noJsPage.getByRole('link', { name: 'Explore my projects', exact: true }).click();
  check('No JavaScript navigation', noJsPage.url().endsWith('#projects') && await noJsPage.getByRole('heading', { name: 'Work in practice.' }).isVisible());
  await noJs.close();

  for (const path of ['/cv.pdf', '/ccdl1-badge.png', '/public/cv.pdf', '/docs/FACTS.md', '/not-a-page']) {
    const res = await page.request.get(origin + path);
    check(`Excluded or missing path ${path}`, res.status() === 404, res.status());
  }
  await page.goto(origin + '/not-a-page');
  check('Custom 404', await page.getByRole('heading', { name: 'This page isn’t here.' }).isVisible());
  await page.getByRole('link', { name: 'Return to homepage' }).click();
  check('404 recovery', page.url() === origin + '/');
  check('Runtime errors', errors.length === 0, errors);
  await page.setViewportSize({ width: 1440, height: 960 });
  return results;
}
