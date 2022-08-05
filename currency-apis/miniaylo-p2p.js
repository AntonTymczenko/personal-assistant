import https from 'https';


const apiRequestOne = async (currencyCode) => new Promise((resolve, reject) => {
  // https://charts.finance.ua/ua/currency/data-archive?for=order&source=1&indicator=eur
  // https://charts.finance.ua/ua/currency/data-archive?for=order&source=1&indicator=usd

  const options = {
    hostname: 'charts.finance.ua',
    port: 443,
    path: `/ua/currency/data-archive?for=order&source=1&indicator=${currencyCode}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = https.request(options, res => {
    let responseData = '';

    res.on('data', chunk => {
      responseData += chunk;
    });

    res.on('end', () => {
      const list = JSON.parse(responseData);
      const lastRecord = list.pop();

      const today = new Date().toLocaleDateString('EN', { month: '2-digit', day: '2-digit', year: 'numeric' });
      const bidRaw = lastRecord[1];
      const askRaw = lastRecord[2];

      const isToday = lastRecord[0] === today;

      const expr = /\d{1,3}\.\d{4}/;
      const hasNumbers = bidRaw.match(expr) && askRaw.match(expr);

      if (!isToday || !hasNumbers) {
        return reject(`Miniaylo P2P JSON validation error`);
      }

      const ask = Number.parseFloat(askRaw);
      const bid = Number.parseFloat(bidRaw);

      resolve({ ask, bid });
    });
  });

  req.on('error', error => {
    reject(error);
  });

  req.end();
});

const apiRequest = async () => {
  const usd = await apiRequestOne('usd');
  const eur = await apiRequestOne('eur');

  return { usd, eur };
};

export default apiRequest;
