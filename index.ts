// 加载.env中的TOKEN配置项
import dotenv from 'dotenv';
import { creatBot } from './bot';
import { startMenu } from './startMenu';
dotenv.config();

if (!process.env.BOT_TOKEN) {
  console.log('-----------------------------------');
  console.log('process.env.TOEKN is not set');
  console.log('-----------------------------------');
  process.exit(1);
}

const bot = creatBot(process.env.BOT_TOKEN);

bot.use(startMenu);
const initialText = 'Hello ! Please choose check out this menu🧐 ';
bot.command('start', async ctx => {
  const message = await ctx.reply(initialText, { reply_markup: startMenu });
  ctx.session.initialMessageId = message.message_id;
});

const messageList = new Map<number, Set<string>>();

async function handleFirstQA(text: string, id: number, ctx: any) {
  const regex_0 = /^[a-zA-Z]{1,8}$/;
  if (!(text && regex_0.test(text))) {
    await ctx.reply(`回复的文字必须为长度不超过8位的英文字符 !`);
    return;
  }
  qaStep.set(id, 1);
  await ctx.reply('Hi, 再回复一下', {
    reply_markup: { force_reply: true },
  });
}
async function handleSecondQA(text: string, id: number, ctx: any) {
  const regex = /^0x[0-9a-zA-Z]{40}$/;
  if (!(text && regex.test(text))) {
    await ctx.reply(`回复内容必须是长度为42位, 0x开头, 由数字和字母组成的字符串 !`);
    return;
  }
  qaStep.set(id, 2);
  const { initialMessageId } = ctx.session;
  ctx.editMessageText('12345', initialMessageId);
  //   ctx.menu.update();
}

const qaStep = new Map<number, number>();
bot.on('message:text', async ctx => {
  // QA message
  if (ctx.message.reply_to_message?.message_id) {
    const id = ctx.message.from.id;
    if (!qaStep.has(id)) qaStep.set(id, 0);
    const text = ctx.message.text!;
    const step = qaStep.get(id)!;
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
          qaStep.set(id, 0);
          await ctx.reply(`回复的文字必须为长度不超过8位的英文字符 !`);
          return;
        }
        qaStep.set(id, 1);
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
          qaStep.set(id, 0);
          await ctx.reply(`回复内容必须是长度为42位, 0x开头, 由数字和字母组成的字符串 !`);
          return;
        }
        qaStep.set(id, 2);
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

bot.start();
