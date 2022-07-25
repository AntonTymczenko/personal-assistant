import puppeteer from 'puppeteer';

import * as currencyPagesMap from './currency-pages/index.js';
import * as currencyApisMap from './currency-apis/index.js';
import formatOutput from './format-output.js';


const getCurrencyRates = async ({ browser, pages, apis }) => {
  const aggregated = {};

  // Crawlers
  await Promise.all(Object.entries(pages).map(async ([pageSlug, pageConfig]) => {
    const { url, crawl } = pageConfig;

    const page = await browser.newPage();
    await page.goto(url); // start page, there may be more inside crawl()
    await page.waitForNetworkIdle();

    try {
      const { usd, eur } = await crawl(page);;
      aggregated[pageSlug] = { usd, eur };
    } catch (e) {}

    await page.close();

  }));

  // API requests
  await Promise.all(Object.entries(apis).map(async ([apiSlug, apiRequest]) => {
    try {
      const { usd, eur } = await apiRequest();;
      aggregated[apiSlug] = { usd, eur };
    } catch (e) {
      console.log(e);
    }
  }));

  return aggregated;
};


(async () => {
  const browser = await puppeteer.launch();
  
  const currencyRates = await getCurrencyRates({
    browser,
    pages: currencyPagesMap,
    apis: currencyApisMap,
  });

  const humanReadableCurrencyRates = formatOutput(currencyRates);

  console.log(humanReadableCurrencyRates);

  await browser.close();
})();
