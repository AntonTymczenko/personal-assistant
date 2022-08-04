import https from 'https';

// https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=5
const options = {
  hostname: 'api.privatbank.ua',
  port: 443,
  path: '/p24api/pubinfo?exchange&json&coursid=5',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};
/*
  [
    {"ccy":"USD","base_ccy":"UAH","buy":"38.40000","sale":"39.10000"},
    {"ccy":"EUR","base_ccy":"UAH","buy":"38.35000","sale":"39.55000"},
    {"ccy":"BTC","base_ccy":"USD","buy":"21665.4673","sale":"23946.0429"}
  ]
*/


const apiRequest = async () => new Promise((resolve, reject) => {
  const req = https.request(options, res => {
    let responseData = '';

    res.on('data', chunk => {
      responseData += chunk;
    });

    res.on('end', () => {
      let list = [];

      try {
        list = JSON.parse(responseData);

        if (!list.length) {
          throw new Error('Empty answer');
        }

        const usdAsk = list.find(item => item.ccy === 'USD' && item.base_ccy === 'UAH').sale;
        const usdBid = list.find(item => item.ccy === 'USD' && item.base_ccy === 'UAH').buy;
        const eurAsk = list.find(item => item.ccy === 'EUR' && item.base_ccy === 'UAH').sale;
        const eurBid = list.find(item => item.ccy === 'EUR' && item.base_ccy === 'UAH').buy;

        resolve({
          usd: { ask: Number(usdAsk), bid: Number(usdBid) },
          eur: { ask: Number(eurAsk), bid: Number(eurBid) },
        });
      } catch (e) {
        return reject(`Privatbank API error: ${e.message}`);
      }
    });
  });

  req.on('error', error => {
    reject(error);
  });

  req.end();
});


export default apiRequest;
