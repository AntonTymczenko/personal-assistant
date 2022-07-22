export const url = 'https://obmin24.if.ua/';

export const crawl = async (page) => {
  const rates = await page.evaluate(() => {
    const usdBid = document
      .querySelector('#currencies .currencies__block:nth-child(2) .currencies__block-buy .currencies__block-num')
      .innerText;
    const usdAsk = document
      .querySelector('#currencies .currencies__block:nth-child(2) .currencies__block-sale .currencies__block-num')
      .innerText;
    const usdName = document
      .querySelector('#currencies .currencies__block:nth-child(2)').innerText;
    if (!usdName.match(/USD/)) throw new Error('USD not found');

    const eurBid = document
      .querySelector('#currencies .currencies__block:nth-child(3) .currencies__block-buy .currencies__block-num')
      .innerText;
    const eurAsk = document
      .querySelector('#currencies .currencies__block:nth-child(3) .currencies__block-sale .currencies__block-num')
      .innerText;
    const eurName = document
      .querySelector('#currencies .currencies__block:nth-child(3)').innerText;
    if (!eurName.match(/EUR/)) throw new Error('EUR not found');

    return {
      usd: { bid: Number.parseFloat(usdBid), ask: Number.parseFloat(usdAsk) },
      eur: { bid: Number.parseFloat(eurBid), ask: Number.parseFloat(eurAsk) },
    };
  })

  return rates;
};

