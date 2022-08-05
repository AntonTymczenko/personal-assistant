export const url = 'https://miniaylo.finance.ua/'; // start page, contains USD p2p

export const crawl = async (page, { logger }) => {
  const log = (txt) => logger.debug(`Miniaylo p2p. ${txt}`);

  // USD p2p
  const usdText = await page.evaluate(() => {
    log('Evaluating USD part');
    const bid = document.querySelector('[data-role="stat-average-bid-value"]').innerText;
    const ask = document.querySelector('[data-role="stat-average-ask-value"]').innerText;

    return { ask, bid };
  });

  const usdBid = Number.parseFloat(usdText.bid);
  const usdAsk = Number.parseFloat(usdText.ask);
  log('Got USD numbers');

  // EUR p2p
  await page.click('ul[data-role="currency-tab"] li[data-currency="EUR"]');
  await page.waitForNetworkIdle();
  const eurText = await page.evaluate(() => {
    log('Evaluating EUR part');
    const bid = document.querySelector('[data-role="stat-average-bid-value"]').innerText;
    const ask = document.querySelector('[data-role="stat-average-ask-value"]').innerText;

    return { ask, bid };
  });

  const eurBid = Number.parseFloat(eurText.bid);
  const eurAsk = Number.parseFloat(eurText.ask);
  log('Got EUR numbers');

  return {
    usd: { bid: usdBid, ask: usdAsk },
    eur: { bid: eurBid, ask: eurAsk },
  };
};

