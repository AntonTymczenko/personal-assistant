import puppeteer from 'puppeteer';

import * as currencyPagesMap from './currency-pages/index.js';

const getCurrencyRates = async (browser) => {
  const aggregated = {};

  await Promise.all(Object.entries(currencyPagesMap).map(async ([pageSlug, pageConfig]) => {
    const { url, crawl } = pageConfig;

    const page = await browser.newPage();
    await page.goto(url); // start page, there may be more inside crawl()
    await page.waitForNetworkIdle();
    await page.screenshot({path: `${pageSlug}-${Date.now()}.png`});

    const { usd, eur } = await crawl(page);;

    await page.close();

    aggregated[pageSlug] = { usd, eur };
  }));

  return aggregated;
};


(async () => {
  const browser = await puppeteer.launch();
  
  const currencyRates = await getCurrencyRates(browser);

  console.log(currencyRates);

  await browser.close();
})();
