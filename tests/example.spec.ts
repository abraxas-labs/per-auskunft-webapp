import { test, expect, Page } from '@playwright/test';
import { TENANTS, PERMISSIONS, SIMPLE_SEARCH_SINGLE_PERSON } from './responses';

test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll('log in', async ({ browser }) => {
  page = await browser.newPage();

  // Prepare API Mocking
  await page.route(/auskunft\/permission/, async (route) => {
    await route.fulfill({ json: PERMISSIONS });
  });
  await page.route(/\/tenants/, async (route) => {
    await route.fulfill({ json: TENANTS });
  });

  await page.route(/\/fullTextSearch/, async (route) => {
    let response = SIMPLE_SEARCH_SINGLE_PERSON;
    let searchTerm = route.request().postDataJSON().fullTextSearch;
    if (searchTerm) {
      response.result.items[0].name.value = searchTerm;
    }
    await route.fulfill({ json: response });
  });

  console.log('Start login');

  await page.goto('/', { timeout: 30000 });
  await page.getByPlaceholder('Username').fill(process.env['AUSKUNFT_USER']!);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill(process.env['AUSKUNFT_PW']!);
  // Alter Login Code, der Probleme gemacht hat.
  // await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('main').getByRole('button', { name: 'Login' }).click();

  let cookies = await page.context().cookies();
  if (cookies.length > 0) {
    console.log('Login successful');
  } else {
    console.error('Login failed');
  }
});

test.beforeEach(async () => {
  await page.goto('/');
});

test.describe("PERREGIST-9999", () => {
  test('Einfache Suche sichtbar', async () => {
    await expect(page.getByPlaceholder('Suche über Personenfelder...')).toBeVisible();
  });

  test('Erweiterte Suche sichtbar', async () => {
    await page.getByRole('button', { name: 'Erweiterte Suche' }).click();
    await expect(page.getByText('Personalien')).toBeVisible();
    await expect(page.getByText('Wohnadresse')).toBeVisible();
    await expect(page.locator('app-extended-search-mask')).toContainText('Personenidentifikatoren');
  });

  test('Einfache Suche mit "Movein"', async () => {
    await page.getByPlaceholder('Suche über Personenfelder...').click();
    await page.getByPlaceholder('Suche über Personenfelder...').fill('Movein');
    await page.getByRole('button', { name: 'Suchen' }).click();
    await expect(page.locator('app-search-result-table')).toContainText('Gefundene Personen: 1');
    await expect(page.getByRole('cell', { name: 'Movein' })).toBeVisible();
  });

});
