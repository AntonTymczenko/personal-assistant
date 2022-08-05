export const url = 'https://tables.finance.ua/ua/currency/cash/-/ua/usd/0'; // start page, contains USD banks

const urlEur = 'https://tables.finance.ua/ua/currency/cash/-/ua/eur/0'; // EUR banks

export const crawl = async (page, { logger }) => {
  const log = (txt) => logger.debug(`Miniaylo banks. ${txt}`);

  // USD
  const usdText = await page.evaluate(() => {
    const txt = document.querySelector('div[class="data-table-footer"] table tr:nth-child(2)').innerText;

    log('Found parent node text USD');

    return txt;
  });

  const usdBid = Number.parseFloat(usdText.split('\t')[0].replace(' ', ''));
  const usdAsk = Number.parseFloat(usdText.split('\t')[1].replace(' ', ''));
  log('Got USD data');

  // EUR
  await page.goto(urlEur);
  await page.waitForSelector('div[class="data-table-footer"] table tr:nth-child(2)');
  const eurText = await page.evaluate(() => {
    const txt = document.querySelector('div[class="data-table-footer"] table tr:nth-child(2)').innerText;

    log('Found parent node text EUR');

    return txt;
  });

  const eurBid = Number.parseFloat(eurText.split('\t')[0].replace(' ', ''));
  const eurAsk = Number.parseFloat(eurText.split('\t')[1].replace(' ', ''));
  log('Got EUR data');

  return {
    usd: { bid: usdBid, ask: usdAsk },
    eur: { bid: eurBid, ask: eurAsk },
  };
};

