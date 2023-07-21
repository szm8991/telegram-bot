// 国内访问超时，使用本地代理
import { SocksProxyAgent } from 'socks-proxy-agent';
const socksAgent = new SocksProxyAgent('socks://127.0.0.1:7890');

import { Bot, Context, SessionFlavor, session } from 'grammy';
interface SessionData {
  isSell:boolean  
  qMessageIds: number[]
    aMessageIds: number[]
    initialMessageId:number
    message:string

}
export type MyContext = Context & SessionFlavor<SessionData>
export function creatBot(token: string) {
  const bot = new Bot<MyContext>(token, {
    client: {
      baseFetchConfig: {
        agent: socksAgent,
        compress: true,
      },
    },
});
    // @ts-ignore
  bot.use(session({
    initial(){
        return { qMessageIds: [],aMessageIds: [],initialMessageId:null,message:"",isSell:false }
    }
}))
  return bot;
}
