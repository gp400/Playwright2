import { test, expect } from '@playwright/test';
const fs = require('fs/promises');

test('has title', async ({ page, context }) => {
  //Login
  await page.goto('https://landing.unapec.edu.do/banner/');

  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByText('Acceso para estudiantes y egresados').click()
  ]);

  const { email, password } = JSON.parse(await fs.readFile(`${__dirname}/../credentials.json`, 'utf8'));

  await newPage.fill('input[name="loginfmt"]', email); // Inserte su email

  await newPage.locator('input[type="submit"]').click();

  await newPage.fill('input[name="passwd"]', password); // Inserte su password

  await newPage.locator('input[type="submit"]').click();

  await newPage.locator('input[id="idBtn_Back"]').click();

  const [newPage2] = await Promise.all([
    context.waitForEvent('page'),
    newPage.getByText('Ver calificaciones').click()
  ]);

  expect(newPage2.getByText("A00114138"));

  await newPage2.locator(".control-group").first().click();

  await new Promise(() => {});
});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
