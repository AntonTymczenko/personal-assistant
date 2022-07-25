import https from 'https';

// https://api.monobank.ua/bank/currency
const options = {
  hostname: 'api.monobank.ua',
  port: 443,
  path: '/bank/currency',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};
/*
[
  {"currencyCodeA":840,"currencyCodeB":980,"date":1658476208,"rateBuy":36.57,"rateSell":36.8704},
  {"currencyCodeA":978,"currencyCodeB":980,"date":1658476208,"rateBuy":37.25,"rateSell":37.5502},
  ...
]
*/


const apiRequest = async () => new Promise((resolve, reject) => {
  const req = https.request(options, res => {
    let responseData = '';

    res.on('data', chunk => {
      responseData += chunk;
    });

    res.on('end', () => {
      const list = JSON.parse(responseData);
      if (typeof list === 'object' && !Array.isArray(list) && list.errorDescription) {
        return reject(`Monobank API error: ${list.errorDescription}`);
      }

      const usdAsk = list.find(item => item.currencyCodeA === 840 && item.currencyCodeB === 980).rateSell;
      const usdBid = list.find(item => item.currencyCodeA === 840 && item.currencyCodeB === 980).rateBuy;
      const eurAsk = list.find(item => item.currencyCodeA === 978 && item.currencyCodeB === 980).rateSell;
      const eurBid = list.find(item => item.currencyCodeA === 978 && item.currencyCodeB === 980).rateBuy;

      resolve({
        usd: { ask: usdAsk, bid: usdBid },
        eur: { ask: eurAsk, bid: eurBid },
      });
    });
  });

  req.on('error', error => {
    reject(error);
  });

  req.end();
});


export default apiRequest;
