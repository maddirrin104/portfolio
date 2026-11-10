async page => {
  const origin = 'http://127.0.0.1:4322';
  const results = [];
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  const check = (name, pass, detail) => {
    results.push({ name, status: pass ? 'PASS' : 'FAIL', detail });
    if (!pass) throw new Error(JSON.stringify(results));
  };

  await page.goto(origin);
  check('Two featured projects', await page.locator('.project-entry').count() === 2);
  check('No Snort on homepage', !(await page.locator('body').innerText()).includes('Snort'));
  for (const slug of ['soc-homelab', 'egis']) {
    const href = `/projects/${slug}/`;
    check(`Homepage link to ${slug}`, await page.locator(`.project-entry a[href="${href}"]`).count() === 1);
  }

  for (const slug of ['soc-homelab', 'egis']) {
    const route = `/projects/${slug}/`;
    const response = await page.goto(origin + route);
    check(`${slug} HTTP`, response.status() === 200, response.status());
    check(`${slug} heading`, await page.locator('h1').count() === 1);
    check(`${slug} metadata`, await page.locator('meta[name="description"]').getAttribute('content') !== '' && (await page.title()).includes(slug === 'egis' ? 'EGIS' : 'SOC Homelab'));
    check(`${slug} evidence links`, await page.locator('.case-article a[href^="https://github.com/"]').count() >= 2);
    check(`${slug} diagram caption`, await page.locator('.case-diagram figcaption').isVisible());
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        document: document.documentElement.scrollWidth,
        diagram: document.querySelector('.case-diagram').getBoundingClientRect().width,
        code: document.querySelector('pre') && { client: document.querySelector('pre').clientWidth, scroll: document.querySelector('pre').scrollWidth },
      }));
      check(`${slug} ${width}px reflow`, layout.document === width && layout.diagram <= width, layout);
      if (slug === 'soc-homelab' && width === 375) check('Mobile code contained', layout.code && layout.code.client <= width && layout.code.scroll >= layout.code.client, layout.code);
      await page.screenshot({ path: `artifacts/task-02/${slug}-${width}.png`, fullPage: true });
    }
    await page.getByRole('link', { name: 'All projects' }).click();
    check(`${slug} return navigation`, page.url() === origin + '/#projects', page.url());
  }

  const noJs = await page.context().browser().newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(origin + '/projects/soc-homelab/');
  check('No JavaScript case content', await noJsPage.getByRole('heading', { name: 'Detection work: two documented searches' }).isVisible());
  await noJs.close();
  check('No browser runtime errors', runtimeErrors.length === 0, runtimeErrors);
  return results;
}
