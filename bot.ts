import dotenv from "dotenv";
import { Bot } from "grammy";
dotenv.config()
if(!process.env.BOT_TOKEN) {
    console.warn('-----------------------------------')
    console.warn('process.env.TOEKN is not set')
    console.warn('-----------------------------------')
    process.exit(1);
}
// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(process.env.BOT_TOKEN); // <-- put your bot token between the ""
// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));
// Handle other messages.
bot.on("message", (ctx) => ctx.reply("Got another message!"));

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// Start the bot.
bot.start();