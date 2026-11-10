async page => {
  const origin = 'http://127.0.0.1:4322';
  const results = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const check = (name, pass, detail) => {
    results.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
    if (!pass) throw new Error(JSON.stringify(results));
  };

  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 375, 812]]) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(origin + '/about/');
    await page.evaluate(() => document.fonts.ready);
    check(`${name} route`, response.status() === 200 && await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));

    await page.locator('.certification-image').evaluate(img => img.decode());
    await page.locator('.certificate-open img').evaluate(img => img.decode());

    const badge = await page.locator('.certification-image').evaluate(img => ({ complete: img.complete, width: img.naturalWidth, height: img.naturalHeight }));
    const certificate = await page.locator('.certificate-open img').evaluate(img => ({
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      renderedWidth: img.getBoundingClientRect().width,
      renderedHeight: img.getBoundingClientRect().height,
    }));
    check(`${name} badge`, badge.complete && badge.width === 560 && badge.height === 560, badge);
    check(`${name} full certificate`, certificate.complete && certificate.naturalWidth === 6600 && certificate.naturalHeight === 5100 && Math.abs(certificate.renderedWidth / certificate.renderedHeight - 6600 / 5100) < .01, certificate);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.locator('#certifications').screenshot({ path: `artifacts/certificate-preview/${name}-${width}.png` });

    const open = page.getByRole('button', { name: 'View full CCDL1 certificate' });
    await open.focus();
    await page.keyboard.press('Enter');
    check(`${name} keyboard opens modal`, await page.locator('#ccdl1-certificate-dialog').evaluate(dialog => dialog.open && document.activeElement === dialog.querySelector('[data-certificate-close]')));
    await page.screenshot({ path: `artifacts/certificate-preview/${name}-modal-${width}.png` });
    await page.keyboard.press('Escape');
    check(`${name} Escape restores focus`, await page.locator('#ccdl1-certificate-dialog').evaluate(dialog => !dialog.open) && await open.evaluate(button => document.activeElement === button));
    await open.click();
    await page.getByRole('button', { name: /Close/ }).click();
    check(`${name} close button`, await page.locator('#ccdl1-certificate-dialog').evaluate(dialog => !dialog.open));
    await open.click();
    await page.mouse.click(2, 2);
    check(`${name} backdrop closes modal`, await page.locator('#ccdl1-certificate-dialog').evaluate(dialog => !dialog.open));
  }

  const asset = await page.request.get(origin + '/images/ccdl1-certificate.webp');
  check('certificate production asset', asset.status() === 200 && asset.headers()['content-type']?.includes('image/webp'), { status: asset.status(), type: asset.headers()['content-type'] });
  check('no credential verification link', await page.getByRole('link', { name: /verify credential/i }).count() === 0 && await page.locator('#certifications a[href="/images/ccdl1-certificate.webp"]').count() === 1);
  check('no runtime errors', errors.length === 0, errors);
  return results;
}
