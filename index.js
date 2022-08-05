import TelegramBot from 'node-telegram-bot-api';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

import Logger from './logger/index.js';
import * as currencyPagesMap from './currency-pages/index.js';
import * as currencyApisMap from './currency-apis/index.js';
import * as currencyTelegramMap from './currency-telegram/index.js';
import formatOutput from './format-output.js';


const getCurrencyRates = async ({ logger, browser, pages, apis, telegram }) => {
  const aggregated = {};

  const crawlerPromises = Object.entries(pages)
    .map(([pageSlug, { url, crawl }]) => async () => {
      logger.debug(`Fetching data from page ${pageSlug}`);
      const page = await browser.newPage();
      logger.debug(`Created new page ${pageSlug} ${url}`);
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 }); // start page, there may be more inside crawl()
        logger.debug(`Start page is ready and network is idle for ${pageSlug}`);
      } catch (e) {
        console.error(e);
      }

      try {
        const { usd, eur } = await crawl(page, { logger });;
        aggregated[pageSlug] = { usd, eur };
        logger.debug(`Saved to aggregated obj data for ${pageSlug}`);
      } catch (e) {}

      await page.close();
      logger.debug(`Closed page with ${pageSlug}`);
    });

  const apiPromises = Object.entries(apis)
    .map(([apiSlug, apiRequest]) => async () => {
      logger.info(`Fetching data from API ${apiSlug}`);
      try {
        const { usd, eur } = await apiRequest();;
        aggregated[apiSlug] = { usd, eur };
      } catch (e) {
        logger.error(e);
      }
    });

  const telegramPromises = Object.entries(telegram)
    .map(([telegramSlug, telegramRequest]) => async () => {
      logger.info(`Fetching data from telegram ${telegramSlug}`);
      try {
        const { usd, eur } = await telegramRequest();;
        aggregated[telegramSlug] = { usd, eur };
      } catch (e) {
        logger.error(e);
      }
    });

  const promises = crawlerPromises
    .concat(telegramPromises)
    .concat(apiPromises);

  await Promise.all(promises.map((promiseFunc) => promiseFunc()));

  return aggregated;
};

const getData = async ({ cache, logger, browser, places }) => {
  const lastCached = cache.length && cache[cache.length - 1];
  if (lastCached) {
    if (cache.find(({ fetching }) => fetching === true)) {
      return;
    }

    const currentMoment = Date.now();
    const timeDiff = currentMoment - lastCached.timestamp

    if (timeDiff < (60000 * 20)) { // 20m
      const min = Math.floor(timeDiff/(1000*60));
      const sec = Math.floor(timeDiff / 1000) % 60;

      const timeAgo = (min ? min + 'min ' : '')
        + ( sec ? sec + 's ' : '')
      logger.info(`Using cached version (${timeAgo || '1s '}ago)`);
      const formattedOutput = formatOutput(lastCached);

      return formattedOutput;
    } else {
      cache.pop();
    }
  }

  const {
    pages,
    apis,
    telegram,
  } = places;

  cache.push({ fetching: true });
  logger.info('Fetching fresh data');
  const currencyRates = await getCurrencyRates({
    logger,
    browser,
    pages,
    apis,
    telegram,
  });

  cache.splice(cache.findIndex(({ fetching }) => fetching === true), 1)
  const timestamp = Date.now();
  // TODO: merge current with the last. Update currency rates instead of creating a new
  // object. Mono might be not present in the latest updates because of 'too many requests'
  cache.push({ currencyRates, timestamp });

  const formattedOutput = formatOutput({ currencyRates });

  return formattedOutput;
};

(async () => {
  const logger = new Logger(['console']);

  if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
    logger.info('Non-prod mode');
  }

  const browserOptions = {
    ignoreDefaultArgs: ['--disable-extensions'],
  };
  if (process.env.NODE_ENV === 'production') {
    browserOptions.args = [ ...(browserOptions.args || []), '--no-sandbox', '--disable-setuid-sandbox' ];
    logger.info('Production mode');
  }
  logger.debug(`browserOptions are ${JSON.stringify(browserOptions)}`);

  const cache = [];
  const browser = await puppeteer.launch(browserOptions);

  const tgToken = process.env.TELEGRAM_BOT_TOKEN;
  const tgWhitelist = JSON.parse(process.env.TELEGRAM_WHITELISTED_IDS);
  const tgAdminId = Number.parseInt(process.env.TELEGRAM_ADMIN_ID, 10);
  const commandsList = [ 'start', 'help' ];
  const bot = new TelegramBot(tgToken, { polling: true });

  bot.on('message', msg => {
    try {
      const chatId = msg.chat.id;
      logger.info(`Received msg from user id ${chatId}`)
      if (tgWhitelist.includes(chatId)) {

        const checkForCommand = msg.text.match(new RegExp(`^\\/(${commandsList.join('|')}).*`));
        if (checkForCommand) {
          const [, command ] = checkForCommand[0].match(new RegExp(`^\\/(${commandsList.join('|')})`));
          const argsMatch = checkForCommand[0].match(new RegExp(`^\\/(${commandsList.join('|')}) (.+)`));
          const args = Array.isArray(argsMatch) && argsMatch[2];


          switch (command) {
            case 'start': {
              logger.info(`START command from ${chatId}`)
              getData({
                cache,
                logger,
                browser,
                places: {
                  pages: currencyPagesMap,
                  apis: currencyApisMap,
                  telegram: currencyTelegramMap,
                },
              }).then((data) => {
                if (data) {
                  logger.info(`Sending response msg to ${chatId}`);
                  bot.sendMessage(chatId, data);
                }
              });
              break;
            }
            default: {
              let response = `Command "${command}"`
                + ( args ? ` args "${args}"`: '');

              logger.info(`${response}. User ID ${chatId}`);
              bot.sendMessage(chatId, response);
            }
          }
        } else {
          const response = `Text "${msg.text}" from @${msg.from.username}`;
          bot.sendMessage(chatId, response);
        }
      } else {
        const response = 'You are not in the whitelist. Access denied';
        logger.info(`Access denied to ${chatId}`);
        bot.sendMessage(chatId, response);
        if (tgAdminId) {
          const { username, first_name, last_name } = msg.from;
          const user = (username ? ` nickname @${username}` : '')
          const fullName = first_name
            + (last_name ? ` ${last_name}` : '')

          const toAdmin = `User [${fullName}](tg://user?id=${chatId})${user} tried to use the bot`;
          bot.sendMessage(tgAdminId, toAdmin, { parse_mode: 'MarkdownV2' });
          logger.info(`Sent message to admin about denied access for ${chatId}`);
        }
      }
    } catch (e) {
      logger.error(e);
    }
  });

  // await browser.close();
})();
