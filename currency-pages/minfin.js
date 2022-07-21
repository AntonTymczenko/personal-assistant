export const url = 'https://minfin.com.ua/ua/currency/nbu/';

export const crawl = async (page) => {
  const text = await page.evaluate(() => {
    return document.querySelector('main section main section').innerText;
  })

  const usdText = (text.match(/^840\tUSD.*\n\n\d+,\d+\n/gm) || [''])[0]
    .replace(/\s/g,' ')
    .match(/\d+,\d+/);
  const eurText = (text.match(/^978\tEUR.*\n\n\d+,\d+\n/gm) || [''])[0]
    .replace(/\s/g,' ')
    .match(/\d+,\d+/);

  const usd = Number.parseFloat(usdText ? usdText[0].replace(',', '.') : usdText);
  const eur = Number.parseFloat(eurText ? eurText[0].replace(',', '.') : eurText);

  return {
    usd: { bid: usd, ask: usd },
    eur: { bid: eur, ask: eur},
  };
};

