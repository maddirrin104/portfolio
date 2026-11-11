async page => {
  const origin = 'http://127.0.0.1:4321';
  const path = '/resume/Vo-Minh-An-Resume.pdf';
  const checks = [];
  const assert = (condition, message) => { if (!condition) throw new Error(message); checks.push(message); };

  const response = await page.request.get(`${origin}${path}`);
  assert(response.status() === 200, 'PDF URL returns 200');
  assert((await response.body()).subarray(0, 5).toString() === '%PDF-', 'PDF URL serves a PDF');

  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
    await page.goto(origin);
    const view = page.getByRole('link', { name: 'View resume PDF in a new tab' });
    assert(await view.count() === 1, `Home view link at ${width}px`);
    assert(await view.getAttribute('href') === path, `Home link URL at ${width}px`);
    assert(await view.getAttribute('target') === '_blank', `Home opens a new tab at ${width}px`);
    assert((await view.getAttribute('rel'))?.includes('noopener'), `Home noopener at ${width}px`);
    const popupPromise = page.context().waitForEvent('page');
    await view.click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    assert(popup.url().includes(path), `Home opens PDF at ${width}px`);
    await popup.close();

    await page.goto(`${origin}/about/`);
    const download = page.getByRole('link', { name: /Download resume \(PDF\)/ });
    assert(await download.count() === 1, `About download link at ${width}px`);
    assert(await download.getAttribute('href') === path, `About link URL at ${width}px`);
    assert(await download.getAttribute('download') === 'Vo-Minh-An-Resume.pdf', `Download filename at ${width}px`);
    const downloadPromise = page.waitForEvent('download');
    await download.click();
    const transfer = await downloadPromise;
    assert(transfer.suggestedFilename() === 'Vo-Minh-An-Resume.pdf', `Browser download at ${width}px`);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `About no horizontal overflow at ${width}px`);
  }

  for (const theme of ['light', 'dark', 'system']) {
    await page.goto(origin);
    await page.locator('.theme-control select').selectOption(theme);
    const link = page.getByRole('link', { name: 'View resume PDF in a new tab' });
    await link.focus();
    const state = await link.evaluate(el => ({ outline: getComputedStyle(el).outlineStyle, background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color }));
    assert(state.outline !== 'none', `${theme} focus outline`);
    assert(state.background !== state.color, `${theme} distinct button colors`);
  }

  return checks;
}
