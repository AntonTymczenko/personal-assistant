import puppeteer from 'puppeteer';

import * as currencyPagesMap from './currency-pages/index.js';

const getCurrencyRates = async (browser) => {
  const aggregated = {};

  await Promise.all(Object.entries(currencyPagesMap).map(async ([pageSlug, pageConfig]) => {
    const { url, crawl } = pageConfig;

    const page = await browser.newPage();
    await page.goto(url); // start page, there may be more inside crawl()
    await page.waitForNetworkIdle();

    const { usd, eur } = await crawl(page);;

    await page.close();

    aggregated[pageSlug] = { usd, eur };
  }));

  return aggregated;
};


(async () => {
  const browser = await puppeteer.launch();
  
  // TODO
  /*
    kit group
      https://obmin24.if.ua/
    Lviv Bank in IF
      https://www.banklviv.com/kurs/
    mono
      https://minfin.com.ua/company/monobank/currency/
    privat
      https://minfin.com.ua/company/privatbank/currency/
  */
  const currencyRates = await getCurrencyRates(browser);
  const humanReadableCurrencyRates =`
    ### USD

    НБУ:\t\t${currencyRates.minfin.usd.ask}
    Банки:\t\t${currencyRates.miniayloBanks.usd.bid}/${currencyRates.miniayloBanks.usd.ask}
    ПОВи:\t\t${currencyRates.miniayloPoints.usd.bid}/${currencyRates.miniayloPoints.usd.ask}
    Міняйло p2p:\t${currencyRates.miniayloP2p.usd.bid}/${currencyRates.miniayloP2p.usd.ask}


    ### EUR

    НБУ:\t\t${currencyRates.minfin.eur.ask}
    Банки:\t\t${currencyRates.miniayloBanks.eur.bid}/${currencyRates.miniayloBanks.eur.ask}
    ПОВи:\t\t${currencyRates.miniayloPoints.eur.bid}/${currencyRates.miniayloPoints.eur.ask}
    Міняйло p2p:\t${currencyRates.miniayloP2p.eur.bid}/${currencyRates.miniayloP2p.eur.ask}
  `;

  console.log(humanReadableCurrencyRates);

  await browser.close();
})();
