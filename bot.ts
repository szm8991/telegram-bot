// 国内访问超时，使用本地代理
import { SocksProxyAgent } from 'socks-proxy-agent';
const socksAgent = new SocksProxyAgent('socks://127.0.0.1:7890');

import { Api, Bot, Context, RawApi, SessionFlavor, session } from 'grammy';

import { startMenu } from './startMenu';
interface SessionData {
  isSell: boolean;
  qMessageIds: number[];
  aMessageIds: number[];
  qaStep:number
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
  bot.use(
    // @ts-ignore
    session({
      initial() {
        return {
          qaStep:0,
          qMessageIds: [],
          aMessageIds: [],
          initialMessageId: null,
          message: '',
          isSell: false,
        };
      },
    })
  );
  initBot(bot);
  return bot;
}

function initBot(bot: Bot<MyContext, Api<RawApi>>) {
  bot.use(startMenu);
  const initialText = 'Hello ! Please choose check out this menu🧐 ';
  bot.command('start', async ctx => {
    const message = await ctx.reply(initialText, { reply_markup: startMenu });
    ctx.session.initialMessageId = message.message_id;
  });
bot.on('message:text', async ctx => {
  // QA message
  if (ctx.message.reply_to_message?.message_id) {
    const id = ctx.message.from.id;
    ctx.session.qaStep
    const text = ctx.message.text!;
    const step =  ctx.session.qaStep;
    switch (step) {
      case 0:
        const regex_0 = /^[a-zA-Z]{1,8}$/;
        if (!(text && regex_0.test(text))) {
          await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
          const aMessageIds = ctx.session.aMessageIds;
          for (let i = 0; i < aMessageIds.length; i++) {
            await ctx.api.deleteMessage(ctx.chat.id, aMessageIds[i]);
          }
          ctx.session.aMessageIds = [];
          const qMessageIds = ctx.session.qMessageIds;
          for (let i = 0; i < qMessageIds.length; i++) {
            await ctx.api.deleteMessage(ctx.chat.id, qMessageIds[i]);
          }
          ctx.session.qMessageIds = [];
          ctx.session.message = '';
          ctx.session.qaStep=0
          await ctx.reply(`回复的文字必须为长度不超过8位的英文字符 !`);
          return;
        }
        ctx.session.qaStep=1
        ctx.session.message += '\n' + text;
        const message = await ctx.reply('Hi, 再按要求回复第二次', {
          reply_markup: { force_reply: true },
        });
        ctx.session.qMessageIds.push(message.message_id);
        ctx.session.aMessageIds.push(ctx.message.message_id);
        break;
      case 1:
        const regex = /^0x[0-9a-zA-Z]{40}$/;
        if (!(text && regex.test(text))) {
          await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
          const aMessageIds = ctx.session.aMessageIds;
          for (let i = 0; i < aMessageIds.length; i++) {
            await ctx.api.deleteMessage(ctx.chat.id, aMessageIds[i]);
          }
          ctx.session.aMessageIds = [];
          const qaMessageIds = ctx.session.qMessageIds;
          for (let i = 0; i < qaMessageIds.length; i++) {
            await ctx.api.deleteMessage(ctx.chat.id, qaMessageIds[i]);
          }
          ctx.session.qMessageIds = [];
          ctx.session.message = '';
          ctx.session.qaStep=0
          await ctx.reply(`回复内容必须是长度为42位, 0x开头, 由数字和字母组成的字符串 !`);
          return;
        }
        ctx.session.qaStep=2
        ctx.session.message += '\n' + text;
        ctx.session.aMessageIds.push(ctx.message.message_id);
        const aMessageIds = ctx.session.aMessageIds;
        for (let i = 0; i < aMessageIds.length; i++) {
          await ctx.api.deleteMessage(ctx.chat.id, aMessageIds[i]);
        }
        ctx.session.aMessageIds = [];
        const qMessageIds = ctx.session.qMessageIds;
        for (let i = 0; i < qMessageIds.length; i++) {
          await ctx.api.deleteMessage(ctx.chat.id, qMessageIds[i]);
        }
        ctx.session.qMessageIds = [];
        const info = ctx.session.message.split('\n');
        ctx.api.editMessageText(
          ctx.chat.id,
          ctx.session.initialMessageId,
          'Oop, here is you info: ' + ctx.session.message,
          {
            reply_markup: startMenu
              .text(
                ctx => info[1],
                ctx => null
              )
              .row()
              .text(
                ctx => info[2],
                ctx => null
              ),
          }
        );
        break;
    }
  }
  // normal message
  else {
    ctx.reply('Echo: ' + ctx.message.text);
  }
});
}

// async function handleFirstQA(text: string, id: number, ctx: any) {
//   const regex_0 = /^[a-zA-Z]{1,8}$/;
//   if (!(text && regex_0.test(text))) {
//     await ctx.reply(`回复的文字必须为长度不超过8位的英文字符 !`);
//     return;
//   }
//   qaStep.set(id, 1);
//   await ctx.reply('Hi, 再回复一下', {
//     reply_markup: { force_reply: true },
//   });
// }
// async function handleSecondQA(text: string, id: number, ctx: any) {
//   const regex = /^0x[0-9a-zA-Z]{40}$/;
//   if (!(text && regex.test(text))) {
//     await ctx.reply(`回复内容必须是长度为42位, 0x开头, 由数字和字母组成的字符串 !`);
//     return;
//   }
//   qaStep.set(id, 2);
//   const { initialMessageId } = ctx.session;
//   ctx.editMessageText('12345', initialMessageId);
//   //   ctx.menu.update();
// }