export const url = 'https://www.banklviv.com/kurs/';
      
export const crawl = async (page) => {
  const rates = await page.evaluate(() => {
    const branches = document.querySelectorAll('.course .accordeon .accordeon-title-js');
    const frankivskBranch = Array.from(branches).find(node => node.innerText.match(/Івано-Франківськ/));
    if (!frankivskBranch) throw new Error('No info for bank Lviv in Ivano-Frankivsk');

    // frankivskBranch.setAttribute('data-branch', 'Ivano-Frankivsk');

    const listItems = Array.from(frankivskBranch.nextElementSibling.querySelectorAll('.table-row'))
      .filter(el => el.querySelector('.currency'));
    const usdNode = listItems.find(node => node.innerText.match(/USD/));
    const eurNode = listItems.find(node => node.innerText.match(/EUR/));

    const [usdBid, usdAsk ] = Array.from(usdNode.querySelectorAll('.price'))
      .map(e => Number.parseFloat(e.innerText));
    const [eurBid, eurAsk ] = Array.from(eurNode.querySelectorAll('.price'))
      .map(e => Number.parseFloat(e.innerText));

    return {
      usd: { ask: usdAsk, bid: usdBid },
      eur: { ask: eurAsk, bid: eurBid },
    };
  })

  return rates;
};

