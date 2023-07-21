import { startMenu } from "./startMenu";

// TODO ctx type
export async function handleQAStep1(text: string, ctx: any) {
    const regex_0 = /^[a-zA-Z]{1,8}$/;
    if (!(text && regex_0.test(text))) {
      await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);

      await clearQA(ctx);

      await ctx.reply(`回复的文字必须为长度不超过8位的英文字符 !`);

      return;
    }

    ctx.session.qaStep = 1;
    ctx.session.message += '\n' + text;

    const message = await ctx.reply('Hi, 再按要求回复第二次', {
      reply_markup: { force_reply: true },
    });

    ctx.session.qMessageIds.push(message.message_id);
    ctx.session.aMessageIds.push(ctx.message.message_id);
  }
export async function handleQAStep2(text: string, ctx: any) {
    const regex = /^0x[0-9a-zA-Z]{40}$/;
    if (!(text && regex.test(text))) {
      await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);

      await clearQA(ctx);

      await ctx.reply(`回复内容必须是长度为42位, 0x开头, 由数字和字母组成的字符串 !`);

      return;
    }
    ctx.session.qaStep = 2;
    ctx.session.message += '\n' + text;

    ctx.session.aMessageIds.push(ctx.message.message_id);
    await clearQAMessage(ctx);
    
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
  }

function clearQA(ctx: any){
    clearQAMessage(ctx)
    clearQAStep(ctx)
    clearQAInfo(ctx)
  }
async function clearQAMessage(ctx: any) {
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
  }
  function clearQAInfo(ctx: any){
    ctx.session.message = '';
  }
  function clearQAStep(ctx: any){
    ctx.session.qaStep = 0;
  }