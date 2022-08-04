import puppeteer from 'puppeteer';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

import * as currencyPagesMap from './currency-pages/index.js';
import * as currencyApisMap from './currency-apis/index.js';
import * as currencyTelegramMap from './currency-telegram/index.js';
import formatOutput from './format-output.js';


const getCurrencyRates = async ({ browser, pages, apis, telegram }) => {
  const aggregated = {};

  const crawlerPromises = Object.entries(pages)
    .map(([pageSlug, { url, crawl }]) => async () => {
      const page = await browser.newPage();
      await page.goto(url); // start page, there may be more inside crawl()
      await page.waitForNetworkIdle();

      try {
        const { usd, eur } = await crawl(page);;
        aggregated[pageSlug] = { usd, eur };
      } catch (e) {}

      await page.close();
    });

  const apiPromises = Object.entries(apis)
    .map(([apiSlug, apiRequest]) => async () => {
      try {
        const { usd, eur } = await apiRequest();;
        aggregated[apiSlug] = { usd, eur };
      } catch (e) {
        console.log(e);
      }
    });

  const telegramPromises = Object.entries(telegram)
    .map(([telegramSlug, telegramRequest]) => async () => {
      try {
        const { usd, eur } = await telegramRequest();;
        aggregated[telegramSlug] = { usd, eur };
      } catch (e) {
        console.log(e);
      }
    });

  const promises = crawlerPromises
    .concat(telegramPromises)
    .concat(apiPromises);

  await Promise.all(promises.map((promiseFunc) => promiseFunc()));

  return aggregated;
};

const getData = async () => {
  const browser = await puppeteer.launch();
  
  const currencyRates = await getCurrencyRates({
    browser,
    pages: currencyPagesMap,
    apis: currencyApisMap,
    telegram: currencyTelegramMap,
  });

  await browser.close();

  const humanReadableCurrencyRates = formatOutput(currencyRates);

  return humanReadableCurrencyRates;
};

(async () => {
  if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
  }

  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgWhitelist = JSON.parse(process.env.TELEGRAM_WHITELISTED_IDS);
  const tgAdminId = Number.parseInt(process.env.TELEGRAM_ADMIN_ID, 10);
  const commandsList = [ 'start', 'help' ];
  const bot = new TelegramBot(tgToken, { polling: true });

  bot.on('message', msg => {
    try {
      const chatId = msg.chat.id;
      if (tgWhitelist.includes(chatId)) {

        const checkForCommand = msg.text.match(new RegExp(`^\\/(${commandsList.join('|')}).*`));
        if (checkForCommand) {
          const [, command ] = checkForCommand[0].match(new RegExp(`^\\/(${commandsList.join('|')})`));
          const argsMatch = checkForCommand[0].match(new RegExp(`^\\/(${commandsList.join('|')}) (.+)`));
          const args = Array.isArray(argsMatch) && argsMatch[2];


          switch (command) {
            case 'start': {
              getData().then((data) => {
                bot.sendMessage(chatId, data);
              });
              break;
            }
            default: {
              let response = `Command "${command}"`
                + ( args ? ` args "${args}"`: '');

              bot.sendMessage(chatId, response);
            }
          }
        } else {
          const response = `Text "${msg.text}" from @${msg.from.username}`;
          bot.sendMessage(chatId, response);
        }
      } else {
        const response = 'You are not in the whitelist. Access denied';
        bot.sendMessage(chatId, response);
        if (tgAdminId) {
          const { username, first_name, last_name } = msg.from;
          const user = (username ? ` nickname @${username}` : '')
          const fullName = first_name
            + (last_name ? ` ${last_name}` : '')

          const toAdmin = `User [${fullName}](tg://user?id=${chatId})${user} tried to use the bot`;
          bot.sendMessage(tgAdminId, toAdmin, { parse_mode: 'MarkdownV2' });
        }
      }
    } catch (e) {
      console.log(e);
    }
  });
})();
