export const url = 'https://www.banklviv.com/kurs/';
      
export const crawl = async (page, { logger }) => {
  const log = (txt) => logger.debug(`Lviv bank page. ${txt}`);

  const rates = await page.evaluate(() => {
    log('Evaluating page Lviv bank');
    const branches = document.querySelectorAll('.course .accordeon .accordeon-title-js');
    const frankivskBranch = Array.from(branches).find(node => node.innerText.match(/Івано-Франківськ/));
    if (!frankivskBranch) throw new Error('No info for bank Lviv in Ivano-Frankivsk');
    log('Found parent node about branch');

    // frankivskBranch.setAttribute('data-branch', 'Ivano-Frankivsk');

    const listItems = Array.from(frankivskBranch.nextElementSibling.querySelectorAll('.table-row'))
      .filter(el => el.querySelector('.currency'));
    log('Got list items');
    const usdNode = listItems.find(node => node.innerText.match(/USD/));
    const eurNode = listItems.find(node => node.innerText.match(/EUR/));

    const [usdBid, usdAsk ] = Array.from(usdNode.querySelectorAll('.price'))
      .map(e => Number.parseFloat(e.innerText));
    const [eurBid, eurAsk ] = Array.from(eurNode.querySelectorAll('.price'))
      .map(e => Number.parseFloat(e.innerText));

    log('Got all data');
    return {
      usd: { ask: usdAsk, bid: usdBid },
      eur: { ask: eurAsk, bid: eurBid },
    };
  })

  return rates;
};

