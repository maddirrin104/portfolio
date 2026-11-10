async page => {
  const origin = 'http://127.0.0.1:4322';
  const routes = [['home', '/'], ['soc', '/projects/soc-homelab/'], ['egis', '/projects/egis/'], ['profile', '/about/']];
  const viewports = [['mobile', 375, 812], ['tablet', 768, 1024], ['desktop', 1440, 900]];
  const results = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const check = (name, pass, detail) => {
    results.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
    if (!pass) throw new Error(JSON.stringify(results));
  };
  const state = () => page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    preference: document.documentElement.dataset.themePreference,
    selected: document.getElementById('theme-select')?.value,
    background: getComputedStyle(document.documentElement).backgroundColor,
    color: getComputedStyle(document.documentElement).color,
    scheme: getComputedStyle(document.documentElement).colorScheme,
    width: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));

  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(origin);
  await page.evaluate(() => localStorage.removeItem('portfolio-theme'));
  await page.reload();
  check('Default follows light system', await state().then(s => s.preference === 'system' && s.selected === 'system' && s.theme === 'light' && s.background === 'rgb(255, 255, 255)'), await state());
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  check('System responds to dark OS', await state().then(s => s.preference === 'system' && s.theme === 'dark' && s.background === 'rgb(20, 30, 40)'), await state());
  await page.emulateMedia({ colorScheme: 'light' });
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  check('System responds back to light OS', await state().then(s => s.theme === 'light'));

  await page.locator('#theme-select').selectOption('dark');
  check('Dark selection persisted', await state().then(s => s.theme === 'dark' && s.preference === 'dark') && await page.evaluate(() => localStorage.getItem('portfolio-theme') === 'dark'));
  await page.reload();
  check('Dark survives refresh', await state().then(s => s.theme === 'dark' && s.selected === 'dark'));
  await page.goto(origin + '/projects/egis/');
  check('Dark survives route', await state().then(s => s.theme === 'dark' && s.selected === 'dark'));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.locator('#theme-select').selectOption('light');
  await page.reload();
  check('Manual light overrides dark OS', await state().then(s => s.theme === 'light' && s.selected === 'light' && s.background === 'rgb(255, 255, 255)'));
  await page.goto(origin + '/about/');
  check('Light survives route', await state().then(s => s.theme === 'light' && s.selected === 'light'));
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  check('OS changes do not replace manual light', await state().then(s => s.theme === 'light' && s.preference === 'light'));
  await page.locator('#theme-select').focus();
  await page.keyboard.press('ArrowDown');
  check('Native switcher supports keyboard', await state().then(s => s.theme === 'dark' && s.selected === 'dark'));
  await page.locator('#theme-select').selectOption('system');
  check('System preference stored', await state().then(s => s.preference === 'system' && s.theme === 'dark') && await page.evaluate(() => localStorage.getItem('portfolio-theme') === 'system'));
  await page.reload();
  check('System survives refresh', await state().then(s => s.preference === 'system' && s.selected === 'system' && s.theme === 'dark'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  check('Reduced motion removes existing transitions', await page.locator('.nav-list a').first().evaluate(el => getComputedStyle(el).transitionDuration === '0s'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  for (const theme of ['light', 'dark']) {
    await page.goto(origin);
    await page.locator('#theme-select').selectOption(theme);
    for (const [viewport, width, height] of viewports) {
      await page.setViewportSize({ width, height });
      for (const [name, route] of routes) {
        const response = await page.goto(origin + route);
        await page.evaluate(() => document.fonts.ready);
        if (name === 'profile') {
          await page.locator('.certificate-open img').scrollIntoViewIfNeeded();
          await page.locator('.certificate-open img').evaluate(img => img.decode());
          await page.evaluate(() => window.scrollTo(0, 0));
        }
        const s = await state();
        const select = await page.locator('#theme-select').evaluate(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
        check(`${theme} ${viewport} ${name}`, response.status() === 200 && s.theme === theme && s.selected === theme && s.documentWidth === width && select.height >= 44, { ...s, select });
        await page.screenshot({ path: `artifacts/theme/${theme}-${name}-${width}.png`, fullPage: true });
        if (name === 'soc') {
          const code = await page.locator('.astro-code').first().evaluate(pre => ({
            background: getComputedStyle(pre).backgroundColor,
            foreground: getComputedStyle(pre.querySelector('span[style]')).color,
            clientWidth: pre.clientWidth,
            scrollWidth: pre.scrollWidth,
          }));
          check(`${theme} ${viewport} code`, code.background === (theme === 'dark' ? 'rgb(36, 41, 46)' : 'rgb(255, 255, 255)') && code.clientWidth <= width, code);
        }
        if (name === 'egis') {
          const diagram = await page.locator('.case-diagram').first().evaluate(el => ({ background: getComputedStyle(el).backgroundColor, width: el.getBoundingClientRect().width }));
          check(`${theme} ${viewport} diagram`, diagram.background === (theme === 'dark' ? 'rgb(32, 53, 70)' : 'rgb(234, 241, 247)') && diagram.width <= width, diagram);
        }
        if (name === 'profile' && width !== 768) {
          await page.getByRole('button', { name: 'View full CCDL1 certificate' }).click();
          const modal = await page.locator('#ccdl1-certificate-dialog').evaluate(el => ({ open: el.open, background: getComputedStyle(el).backgroundColor, imageWidth: el.querySelector('.certificate-dialog-content > img').getBoundingClientRect().width }));
          check(`${theme} ${viewport} certificate modal`, modal.open && modal.background === (theme === 'dark' ? 'rgb(38, 55, 70)' : 'rgb(255, 255, 255)') && modal.imageWidth > 0, modal);
          await page.screenshot({ path: `artifacts/theme/${theme}-certificate-modal-${width}.png` });
          await page.keyboard.press('Escape');
          check(`${theme} ${viewport} modal closes`, await page.locator('#ccdl1-certificate-dialog').evaluate(el => !el.open));
        }
      }
    }
  }

  const noJs = await page.context().browser().newContext({ javaScriptEnabled: false, colorScheme: 'dark' });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(origin);
  check('No-JS system dark fallback', await noJsPage.evaluate(() => getComputedStyle(document.documentElement).backgroundColor === 'rgb(20, 30, 40)' && !document.documentElement.dataset.theme));
  await noJs.close();

  const blocked = await page.context().browser().newContext({ colorScheme: 'light' });
  await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('storage unavailable'); } }));
  const blockedPage = await blocked.newPage();
  const blockedErrors = [];
  blockedPage.on('pageerror', error => blockedErrors.push(error.message));
  await blockedPage.goto(origin);
  await blockedPage.locator('#theme-select').selectOption('dark');
  check('Storage unavailable degrades safely', await blockedPage.evaluate(() => document.documentElement.dataset.theme === 'dark') && blockedErrors.length === 0, blockedErrors);
  await blocked.close();

  const firstPaint = await page.context().browser().newContext({ colorScheme: 'light' });
  await firstPaint.addInitScript(() => {
    localStorage.setItem('portfolio-theme', 'dark');
    requestAnimationFrame(() => {
      window.__themeFirstFrame = {
        theme: document.documentElement.dataset.theme,
        background: getComputedStyle(document.documentElement).backgroundColor,
      };
    });
  });
  const firstPage = await firstPaint.newPage();
  await firstPage.goto(origin);
  const frame = await firstPage.evaluate(() => window.__themeFirstFrame);
  check('Stored dark applied by first frame', frame?.theme === 'dark' && frame?.background === 'rgb(20, 30, 40)', frame);
  await firstPaint.close();

  check('No browser runtime errors', errors.length === 0, errors);
  return results;
}
