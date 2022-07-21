export const url = 'https://tables.finance.ua/ua/currency/cash/-/ua/usd/0'; // start page, contains USD banks

const urlEur = 'https://tables.finance.ua/ua/currency/cash/-/ua/eur/0'; // EUR banks

export const crawl = async (page) => {
  // USD
  const usdText = await page.evaluate(() => {
    return document.querySelector('div[class="data-table-footer"] table tr:nth-child(2)').innerText;
  });

  const usdBid = Number.parseFloat(usdText.split('\t')[0].replace(' ', ''));
  const usdAsk = Number.parseFloat(usdText.split('\t')[1].replace(' ', ''));

  // EUR
  await page.goto(urlEur);
  await page.waitForSelector('div[class="data-table-footer"] table tr:nth-child(2)');
  await page.screenshot({path: `miniayloBanks-${Date.now()}.png`});
  const eurText = await page.evaluate(() => {
    return document.querySelector('div[class="data-table-footer"] table tr:nth-child(2)').innerText;
  });

  const eurBid = Number.parseFloat(eurText.split('\t')[0].replace(' ', ''));
  const eurAsk = Number.parseFloat(eurText.split('\t')[1].replace(' ', ''));

  return {
    usd: { bid: usdBid, ask: usdAsk },
    eur: { bid: eurBid, ask: eurAsk },
  };
};

