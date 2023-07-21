// 国内访问超时，使用本地代理
import { SocksProxyAgent } from 'socks-proxy-agent';

const socksAgent = new SocksProxyAgent('socks://127.0.0.1:7890');

// 加载.env中的TOKEN配置项
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.BOT_TOKEN) {
  console.log('-----------------------------------');
  console.log('process.env.TOEKN is not set');
  console.log('-----------------------------------');
  process.exit(1);
}

import { Bot } from 'grammy';
import { startMenu } from './startMenu';
const bot = new Bot(process.env.BOT_TOKEN, {
  client: {
    baseFetchConfig: {
      agent: socksAgent,
      compress: true,
    },
  },
});
bot.use(startMenu)

bot.command('start', async ctx => {
  await ctx.reply('Check out this menu🧐:', { reply_markup: startMenu });
});

const addStepMap = new Map<number, number>();


bot.on('message', async ctx => {
  const message = ctx.message;
  if (message.reply_to_message?.message_id) {
    const id = ctx.message.from.id;
    if (!addStepMap.has(id)) addStepMap.set(id, 0);
    const text = ctx.message.text;
    const step = addStepMap.get(id);
    switch (step) {
      case 0:
        const regex_0 = /^[a-zA-Z]{1,8}$/;
        if (!(text && regex_0.test(text))) {
          await bot.api.sendMessage(id, `回复的文字必须为长度不超过8位的英文字符 !`);
          return;
        }
        addStepMap.set(id, 1);
        await ctx.reply('Hi, 再回复一下', {
          reply_markup: { force_reply: true },
        });
        break;
      case 1:
        const regex = /^0x[0-9a-zA-Z]{40}$/;
        if (!(text && regex.test(text))) {
          await bot.api.sendMessage(
            id,
            `回复内容必须是长度为42位，0x开头，由数字和字母组成的字符串 !`
          );
          return;
        }
        addStepMap.set(id, 2);
        await ctx.reply('Check out this menu🧐:', { reply_markup: startMenu });
        break;
      default:
        break;
    }
  }
  else{
    ctx.reply("Echo: " + ctx.message.text)
  }
});

bot.start();

console.log('-------------------------start-----------------------------');
