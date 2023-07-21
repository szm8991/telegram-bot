// 加载.env中的TOKEN配置项
import dotenv from 'dotenv';
import { creatBot } from './bot';
dotenv.config();

if (!process.env.BOT_TOKEN) {
  console.log('-----------------------------------');
  console.log('process.env.TOEKN is not set');
  console.log('-----------------------------------');
  process.exit(1);
}

const bot = creatBot(process.env.BOT_TOKEN);

bot.start();
