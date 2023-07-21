
import { Menu } from '@grammyjs/menu';
import { MyContext } from './bot';

export const startMenu = new Menu<MyContext>('start-menu')
  .text(' 👉 Add ', async ctx => {
    const message = await ctx.reply('Hi, 收到请按要求回复', {reply_markup: { force_reply: true }, });
    ctx.session.qMessageIds.push(message.message_id);
  })
  .text(' 👉 Switch ', ctx => {
    ctx.session.isSell=!ctx.session.isSell;
    ctx.menu.update();
  })
  .row()
  .text(
    ctx => (ctx.from && ctx.session.isSell ? ' 🥰 Sell ' : ' 🥰 Buy ') + '0.01 ',
    ctx => ctx.reply(ctx.from && ctx.session.isSell ? ' Sell !' : ' Buy !')
  )
  .text(
    ctx => (ctx.from && ctx.session.isSell ? ' 🥰 Sell ' : ' 🥰 Buy ') + '0.05 ',
    ctx => ctx.reply(ctx.from && ctx.session.isSell ? ' Sell !' : ' Buy !')
  )
  .row()
  // .text(' 🥱Btn 5 ', ctx => ctx.reply('Yawn !'))
  // .text(' 😴Btn 6 ', ctx => ctx.reply('Sleep !'));
