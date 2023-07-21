import { Bot, Context, InlineKeyboard } from 'grammy';

const sellLists = new Set<number>();
function toggleBuyOrSell(id: number) {
  if (sellLists.has(id)) sellLists.delete(id);
  else sellLists.add(id);
}

const menuConfig = {
  '👉Add': {
    newRow: false,
    callback: async (ctx: Context) => {
      ctx.reply('Hi, 收到请回复', {
        reply_markup: { force_reply: true },
      });
    },
  },
  '👉Switch': {
    newRow: true,
     callback: async (ctx: Context) => {
      ctx.reply('Hi, 收到请回复', {
        reply_markup: { force_reply: true },
      });
    },
  },
  '🥰Buy 0.01': {
    newRow: false, callback: async (ctx: Context) => {
      ctx.reply('Hi, 收到请回复', {
        reply_markup: { force_reply: true },
      });
    },
  },
  '🥰Buy 0.05': {
    newRow: true, callback: async (ctx: Context) => {
      ctx.reply('Hi, 收到请回复', {
        reply_markup: { force_reply: true },
      });
    },
  },
};
export function creatMenu(bot:Bot) {
  const menu = new InlineKeyboard();
  for (const [label, config] of Object.entries(menuConfig)) {
    config.newRow ? menu.text(label, `click-${label}`).row() : menu.text(label, `click-${label}`);
    bot.callbackQuery(`click-${label}`, config.callback);
  }
  return menu;
}

export function initMenu(bot:Bot){
  return creatMenu(bot)
}