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

  await page.goto(origin);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' }).click();
  check('Homepage to profile', page.url() === origin + '/about/', page.url());
  check('Current page navigation', await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' }).getAttribute('aria-current') === 'page');
  check('Profile structure', await page.locator('h1').count() === 1 && await page.locator('main').count() === 1 && await page.locator('section.profile-section').count() === 4);
  check('Experience scope', await page.getByRole('heading', { name: /System Intern at vHost/ }).count() === 1 && await page.locator('#experience-vhost li').count() === 3);
  check('Education in progress', await page.locator('#education').innerText().then(text => text.includes('In progress') && text.includes('Expected January 2027')));
  check('Certificate without invented credential URL', await page.locator('#certifications').innerText().then(text => text.includes('Certified CyberDefender Level 1') && text.includes('4 October 2026')) && await page.getByRole('link', { name: /verify credential/i }).count() === 0);
  check('No unverified employers or awards', await page.locator('main').innerText().then(text => !/405CYSE|Wischain|WANNAAI|3rd Place/.test(text)));
  check('Skills linked to projects', await page.locator('#skills a[href="/projects/soc-homelab/"]').count() === 2 && await page.locator('#skills a[href="/projects/egis/"]').count() === 1);
  check('No private contact', await page.locator('main').innerText().then(text => !/\b(?:\+?84|0)\d{8,10}\b|@/.test(text)));

  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, heading: document.querySelector('h1').getBoundingClientRect().width }));
    check(`Profile reflow ${width}`, layout.viewport === layout.document && layout.heading <= width, layout);
    await page.screenshot({ path: `artifacts/task-03/profile-${width}.png`, fullPage: true });
  }

  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'Technical skills' }).click();
  check('Profile anchor navigation', page.url().endsWith('#skills'), page.url());
  await page.locator('#skills a[href="/projects/soc-homelab/"]').first().click();
  check('Skill to SOC case study', page.url() === origin + '/projects/soc-homelab/', page.url());
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' }).click();
  check('Case study to profile', page.url() === origin + '/about/', page.url());
  await page.goto(origin + '/about/');
  await page.keyboard.press('Tab');
  check('Keyboard skip link visible', await page.evaluate(() => document.activeElement.textContent === 'Skip to content' && document.activeElement.getBoundingClientRect().top >= 0 && getComputedStyle(document.activeElement).outlineStyle !== 'none'));
  await page.keyboard.press('Enter');
  check('Skip link reaches main', await page.evaluate(() => document.activeElement.id === 'main'));
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  check('200% text resize', await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });

  const noJs = await page.context().browser().newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(origin + '/about/');
  check('Profile without JavaScript', await noJsPage.getByRole('heading', { name: 'Technical skills' }).isVisible());
  await noJs.close();
  check('No browser errors', errors.length === 0, errors);
  return results;
}
