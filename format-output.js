
const formatOutput = (currencyRates) => {
  const format = (sourceSlug, currencySlug) => {
    const prefixes = {
      minfin: 'НБУ:\t\t',
      miniayloBanks: 'Банки:\t\t',
      miniayloPoints: 'ПОВи:\t\t',
      miniayloP2p: 'Міняйло p2p:\t',
      mono: 'Mono:\t\t',
      bankLvivIF: 'Bank Lviv IF:\t',
      kitGroupIF: 'Kit group IF:\t',
    };
    const formatBySourceSlug = (source) => {
      const cur = currencyRates[source][currencySlug];
      if (source === 'minfin') {
        return `${prefixes[source]}${cur.ask}`;
      } else {
        return `${prefixes[source]}${cur.bid}/${cur.ask}`;
      };
    };

    let output = `${prefixes[sourceSlug]}N/A`;
    try {
      output = formatBySourceSlug(sourceSlug);
    } catch (e) {};

    return output;
  };

  return `
    ### USD

    ${format('minfin', 'usd')}
    ${format('miniayloBanks', 'usd')}
    ${format('miniayloPoints', 'usd')}
    ${format('miniayloP2p', 'usd')}

    ${format('mono', 'usd')}

    ${format('bankLvivIF', 'usd')}
    ${format('kitGroupIF', 'usd')}



    ### EUR

    ${format('minfin', 'eur')}
    ${format('miniayloBanks', 'eur')}
    ${format('miniayloPoints', 'eur')}
    ${format('miniayloP2p', 'eur')}

    ${format('mono', 'eur')}

    ${format('bankLvivIF', 'eur')}
    ${format('kitGroupIF', 'eur')}
  `;

};

export default formatOutput;
