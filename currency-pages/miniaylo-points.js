export const url = 'https://tables.finance.ua/ua/currency/cash/-/ua/usd/2'; // start page, contains USD banks

const urlEur = 'https://tables.finance.ua/ua/currency/cash/-/ua/eur/2'; // EUR banks

export const crawl = async (page, { logger }) => {
  const log = (txt) => logger.debug(`Miniaylo points. ${txt}`);

  // USD
  const usdText = await page.evaluate(() => {
    const txt = document.querySelector('div[class="data-table-footer"] table tr:nth-child(2)').innerText;

    log('Got parent node with USD text');

    return txt;
  });

  const usdBid = Number.parseFloat(usdText.split('\t')[0].replace(' ', ''));
  const usdAsk = Number.parseFloat(usdText.split('\t')[1].replace(' ', ''));
  log('Got USD numbers');

  // EUR
  await page.goto(urlEur);
  await page.waitForSelector('div[class="data-table-footer"] table tr:nth-child(2)');
  const eurText = await page.evaluate(() => {
    const txt = document.querySelector('div[class="data-table-footer"] table tr:nth-child(2)').innerText;

    log('Got parent node with EUR text');

    return txt;
  });

  const eurBid = Number.parseFloat(eurText.split('\t')[0].replace(' ', ''));
  const eurAsk = Number.parseFloat(eurText.split('\t')[1].replace(' ', ''));
  log('Got EUR numbers');

  return {
    usd: { bid: usdBid, ask: usdAsk },
    eur: { bid: eurBid, ask: eurAsk },
  };
};

