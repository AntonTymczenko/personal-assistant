// https://t.me/obmenka_ivanofrankivsk

/**
Для наших шановних підписників-мандрівників публікуємо середню вартість кави у містах світу!!!

🔺ВАРТІСТЬ ОДНІЄЇ ☕️ ЗАПАШНОЇ КАВИ У МІСТАХ СВІТУ НА 04.08.2022🔻

Вашингтон 🇺🇸 
від 38,50 грн до 40,00 грн за одну ☕️  запашної кави

Брюссель 🇪🇺
від 38,60 грн до 40,60 грн за одну ☕️ запашної кави

Лондон 🇬🇧 
від 43,00 грн до 48,00 грн за одну ☕️ запашної кави

Варшава 🇵🇱
від 8,00 грн до 8,60 грн за одну ☕️ запашної кави
                                                                                                                                                                                                                                                                                                                                                                                                                                                   
УВАГА! Вартість кави може змінюватись протягом дня як в 📈, так і в 📉 сторону.                                                                                                           
 */
const tgChannelRequest = async () => {
  const list = [
    'foo text',
    'bar text',
  ];

  // TODO: finds first, change to last
  const rates = (list.filter(msg => msg.match(/ВАРТІСТЬ ОДНІЄЇ ☕️ ЗАПАШНОЇ КАВИ У МІСТАХ СВІТУ НА/gm)))[0] || '';

  const usd = (rates.match(/🇺🇸.*\n.*\n\n/gm) || [''])[0];
  const eur = (rates.match(/🇪🇺.*\n.*\n\n/gm) || [''])[0];

  const [ usdBid, usdAsk ] = usd.replace('\n',' ').match(/\d{1,3},\d{2}/g) || ['0', '0'];
  const [ eurBid, eurAsk ] = eur.replace('\n',' ').match(/\d{1,3},\d{2}/g) || ['0', '0'];

  return {
    usd: { ask: Number(usdAsk.replace(',', '.')), bid: Number(usdBid.replace(',', '.')) },
    eur: { ask: Number(eurAsk.replace(',', '.')), bid: Number(eurBid.replace(',', '.')) },
  };
};

export default tgChannelRequest;
