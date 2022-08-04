import puppeteer from 'puppeteer';

import * as currencyPagesMap from './currency-pages/index.js';
import * as currencyApisMap from './currency-apis/index.js';
import * as currencyTelegramMap from './currency-telegram/index.js';
import formatOutput from './format-output.js';


const getCurrencyRates = async ({ browser, pages, apis, telegram }) => {
  const aggregated = {};

  const crawlerPromises = Object.entries(pages)
    .map(([pageSlug, { url, crawl }]) => async () => {
      const page = await browser.newPage();
      await page.goto(url); // start page, there may be more inside crawl()
      await page.waitForNetworkIdle();

      try {
        const { usd, eur } = await crawl(page);;
        aggregated[pageSlug] = { usd, eur };
      } catch (e) {}

      await page.close();
    });

  const apiPromises = Object.entries(apis)
    .map(([apiSlug, apiRequest]) => async () => {
      try {
        const { usd, eur } = await apiRequest();;
        aggregated[apiSlug] = { usd, eur };
      } catch (e) {
        console.log(e);
      }
    });

  const telegramPromises = Object.entries(telegram)
    .map(([telegramSlug, telegramRequest]) => async () => {
      try {
        const { usd, eur } = await telegramRequest();;
        aggregated[telegramSlug] = { usd, eur };
      } catch (e) {
        console.log(e);
      }
    });

  const promises = crawlerPromises
    .concat(telegramPromises)
    .concat(apiPromises);

  await Promise.all(promises.map((promiseFunc) => promiseFunc()));

  return aggregated;
};


(async () => {
  const browser = await puppeteer.launch();
  
  const currencyRates = await getCurrencyRates({
    browser,
    pages: currencyPagesMap,
    apis: currencyApisMap,
    telegram: currencyTelegramMap,
  });

  const humanReadableCurrencyRates = formatOutput(currencyRates);

  console.log(humanReadableCurrencyRates);

  await browser.close();
})();
