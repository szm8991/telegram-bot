import dotenv from "dotenv";
import { Bot } from "grammy";
import { SocksProxyAgent } from "socks-proxy-agent";

const socksAgent = new SocksProxyAgent('socks://127.0.0.1:7890');
dotenv.config()

if(!process.env.BOT_TOKEN) {
    console.log('-----------------------------------')
    console.log('process.env.TOEKN is not set')
    console.log('-----------------------------------')
    process.exit(1);
}
const bot = new Bot('6362887251:AAE48GI87EQekcGtweaSqNCzgBizNdMuxVs',{
    client: {
        baseFetchConfig: {
          agent: socksAgent,
          compress: true,
        },
      },
});

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
bot.on("message:text", (ctx) => ctx.reply("Echo: " + ctx.message.text));

bot.start();

console.log('-------------------------start-----------------------------')