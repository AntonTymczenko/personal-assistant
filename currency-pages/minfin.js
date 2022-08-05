import { timeout } from './config.js';


const url = 'https://minfin.com.ua/ua/currency/nbu/';

const crawl = async ({ debug, page }) => {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  debug('Start page is ready, has DOM content loaded. Evaluating');

  const text = await page.evaluate(() => {
    const txt = document.querySelector('main section main section').innerText;

    return txt;
  })
  debug('Evaluated');

  const usdText = (text.match(/^840\tUSD.*\n\n\d+,\d+\n/gm) || [''])[0]
    .replace(/\s/g,' ')
    .match(/\d+,\d+/);
  const eurText = (text.match(/^978\tEUR.*\n\n\d+,\d+\n/gm) || [''])[0]
    .replace(/\s/g,' ')
    .match(/\d+,\d+/);

  debug('Got raw data as text');

  const usd = Number.parseFloat(usdText ? usdText[0].replace(',', '.') : usdText);
  const eur = Number.parseFloat(eurText ? eurText[0].replace(',', '.') : eurText);

  debug('Got numbers');

  return {
    usd: { bid: usd, ask: usd },
    eur: { bid: eur, ask: eur},
  };
};


export default crawl;
