import { timeout } from './config.js';


const url = 'https://tables.finance.ua/ua/currency/cash/-/ua/usd/2'; // start page, contains USD banks

const urlEur = 'https://tables.finance.ua/ua/currency/cash/-/ua/eur/2'; // EUR banks


const crawl = async ({ debug, page }) => {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  debug(`Start page is ready, has DOM content loaded. Evaluating`);

  // USD
  debug('Evaluate USD part');
  const usdText = await page.evaluate(() => {
    const txt = document.querySelector('div[class="data-table-footer"] table tr:nth-child(2)').innerText;


    return txt;
  });

  const usdBid = Number.parseFloat(usdText.split('\t')[0].replace(' ', ''));
  const usdAsk = Number.parseFloat(usdText.split('\t')[1].replace(' ', ''));
  debug('Got USD numbers');

  // EUR
  debug('Evaluate EUR part');
  await page.goto(urlEur, { waitUntil: 'domcontentloaded', timeout });
  await page.waitForSelector('div[class="data-table-footer"] table tr:nth-child(2)', { timeout });
  const eurText = await page.evaluate(() => {
    const txt = document.querySelector('div[class="data-table-footer"] table tr:nth-child(2)').innerText;

    return txt;
  });

  const eurBid = Number.parseFloat(eurText.split('\t')[0].replace(' ', ''));
  const eurAsk = Number.parseFloat(eurText.split('\t')[1].replace(' ', ''));
  debug('Got EUR numbers');

  return {
    usd: { bid: usdBid, ask: usdAsk },
    eur: { bid: eurBid, ask: eurAsk },
  };
};


export default crawl;
