import puppeteer from 'puppeteer';

import * as currencyPagesMap from './currency-pages/index.js';
import * as currencyApisMap from './currency-apis/index.js';

const getCurrencyRates = async ({ browser, pages, apis }) => {
  const aggregated = {};

  // Crawlers
  await Promise.all(Object.entries(pages).map(async ([pageSlug, pageConfig]) => {
    const { url, crawl } = pageConfig;

    const page = await browser.newPage();
    await page.goto(url); // start page, there may be more inside crawl()
    await page.waitForNetworkIdle();

    const { usd, eur } = await crawl(page);;

    await page.close();

    aggregated[pageSlug] = { usd, eur };
  }));

  // API requests
  await Promise.all(Object.entries(apis).map(async ([apiSlug, apiRequest]) => {
    const { usd, eur } = await apiRequest();;

    aggregated[apiSlug] = { usd, eur };
  }));

  return aggregated;
};


(async () => {
  const browser = await puppeteer.launch();
  
  // TODO
  /*
    privat
      https://minfin.com.ua/company/privatbank/currency/
  */
  const currencyRates = await getCurrencyRates({
    browser,
    pages: currencyPagesMap,
    apis: currencyApisMap,
  });
  const humanReadableCurrencyRates =`
    ### USD

    НБУ:\t\t${currencyRates.minfin.usd.ask}
    Банки:\t\t${currencyRates.miniayloBanks.usd.bid}/${currencyRates.miniayloBanks.usd.ask}
    ПОВи:\t\t${currencyRates.miniayloPoints.usd.bid}/${currencyRates.miniayloPoints.usd.ask}
    Міняйло p2p:\t${currencyRates.miniayloP2p.usd.bid}/${currencyRates.miniayloP2p.usd.ask}

    Mono:\t\t${currencyRates.mono.usd.bid}/${currencyRates.mono.usd.ask}

    Bank Lviv IF:\t${currencyRates.bankLvivIF.usd.bid}/${currencyRates.bankLvivIF.usd.ask}
    Kit group IF:\t${currencyRates.kitGroupIF.usd.bid}/${currencyRates.kitGroupIF.usd.ask}



    ### EUR

    НБУ:\t\t${currencyRates.minfin.eur.ask}
    Банки:\t\t${currencyRates.miniayloBanks.eur.bid}/${currencyRates.miniayloBanks.eur.ask}
    ПОВи:\t\t${currencyRates.miniayloPoints.eur.bid}/${currencyRates.miniayloPoints.eur.ask}
    Міняйло p2p:\t${currencyRates.miniayloP2p.eur.bid}/${currencyRates.miniayloP2p.eur.ask}

    Mono:\t\t${currencyRates.mono.eur.bid}/${currencyRates.mono.eur.ask}

    Bank Lviv IF:\t${currencyRates.bankLvivIF.eur.bid}/${currencyRates.bankLvivIF.eur.ask}
    Kit group IF:\t${currencyRates.kitGroupIF.eur.bid}/${currencyRates.kitGroupIF.eur.ask}
  `;

  console.log(humanReadableCurrencyRates);

  await browser.close();
})();
