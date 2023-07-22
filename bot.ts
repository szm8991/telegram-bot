// 国内访问超时，使用本地代理
import { SocksProxyAgent } from 'socks-proxy-agent';
const socksAgent = new SocksProxyAgent('socks://127.0.0.1:7890');

import { Api, Bot, Context, RawApi, SessionFlavor, session } from 'grammy';

import { handleQAStep1, handleQAStep2 } from './botAPI';
import { startMenu } from './startMenu';
interface SessionData {
  isSell: boolean;
  qMessageIds: number[];
  aMessageIds: number[];
  qaStep: number;
  initialMessageId: number;
  message: string;
}
export type MyContext = Context & SessionFlavor<SessionData>;

export function creatBot(token: string) {
  const bot = new Bot<MyContext>(token, {
    client: {
      baseFetchConfig: {
        agent: socksAgent,
        compress: true,
      },
    },
  });
  initSession(bot)
  initAction(bot);
  return bot;
}

function initSession(bot: Bot<MyContext, Api<RawApi>>){
  bot.use(
    // @ts-ignore
    session({
      initial() {
        return {
          qaStep: 0,
          qMessageIds: [],
          aMessageIds: [],
          initialMessageId: null,
          message: '',
          isSell: false,
        };
      },
    })
  );
}

function initAction(bot: Bot<MyContext, Api<RawApi>>) {
  bot.use(startMenu);
  const initialText = 'Hello ! Please choose check out this menu🧐 ';
  bot.command('start', async ctx => {
    const message = await ctx.reply(initialText, { reply_markup: startMenu });
    ctx.session.initialMessageId = message.message_id;
  });
  bot.on('message:text', async ctx => {
    // QA message
    if (ctx.message.reply_to_message?.message_id) {
      const text = ctx.message.text!;
      const step = ctx.session.qaStep;
      switch (step) {
        case 0:
          handleQAStep1(text, ctx);
          break;
        case 1:
          handleQAStep2(text, ctx);
          break;
      }
    }
    // normal message
    else {
      ctx.reply('Echo: ' + ctx.message.text);
    }
  });
}