import { Menu } from '@grammyjs/menu';

const sellLists = new Set<number>();
function toggleBuyOrSell(id: number) {
  if (sellLists.has(id)) sellLists.delete(id);
  else sellLists.add(id);
}

export const startMenu = new Menu('start-menu')
  .text(' 👉Add ', ctx => {
    ctx.reply('Hi, 收到请回复', {
      reply_markup: { force_reply: true },
    });
  })
  .text(' 👉Switch ', ctx => {
    toggleBuyOrSell(ctx.from.id);
    ctx.menu.update();
  })
  .row()
  .text(
    ctx => (ctx.from && sellLists.has(ctx.from.id) ? ' 🥰Sell ' : ' 🥰Buy ') + '0.01 ',
    ctx => ctx.reply(ctx.from && sellLists.has(ctx.from.id) ? ' Sell !' : ' Buy !')
  )
  .text(
    ctx => (ctx.from && sellLists.has(ctx.from.id) ? ' 🥰Sell ' : ' 🥰Buy ') + '0.05 ',
    ctx => ctx.reply(ctx.from && sellLists.has(ctx.from.id) ? ' Sell !' : ' Buy !')
  )
//   .row()
//   .text(' 🥱Btn 5 ', ctx => ctx.reply('Yawn !'))
//   .text(' 😴Btn 6 ', ctx => ctx.reply('Sleep !'));
