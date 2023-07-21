import { Menu, MenuRange } from '@grammyjs/menu';
import { Bot, Context, SessionFlavor, session } from 'grammy';
import { SocksProxyAgent } from 'socks-proxy-agent';
const socksAgent = new SocksProxyAgent('socks://127.0.0.1:7890');
/** This is how the dishes look that this bot is managing */
interface Dish {
    id: string
    name: string
}

interface SessionData {
    favoriteIds: string[]
}
type MyContext = Context & SessionFlavor<SessionData>

/**
 * All known dishes. Users can rate them to store which ones are their favorite
 * dishes.
 *
 * They can also decide to delete them. If a user decides to delete a dish, it
 * will be gone for everyone.
 */
const dishDatabase: Dish[] = [
    { id: 'pasta', name: 'Pasta' },
    { id: 'pizza', name: 'Pizza' },
    { id: 'sushi', name: 'Sushi' },
    { id: 'entrct', name: 'Entrecôte' },
]

const bot = new Bot<MyContext>('6362887251:AAE48GI87EQekcGtweaSqNCzgBizNdMuxVs',{
    client: {
      baseFetchConfig: {
        agent: socksAgent,
        compress: true,
      },
    },
  })

bot.use(
    session({
        initial(): SessionData {
            return { favoriteIds: [] }
        },
    })
)

// Create a dynamic menu that lists all dishes in the dishDatabase,
// one button each
const mainText = 'Pick a dish to rate it!'
const mainMenu = new Menu<MyContext>('food')
mainMenu.dynamic(() => {
    const range = new MenuRange<MyContext>()
    for (const dish of dishDatabase) {
        range
            .submenu(
                { text: dish.name, payload: dish.id }, // label and payload
                'dish', // navigation target menu
                ctx =>
                    ctx.editMessageText(dishText(dish.name), {
                        parse_mode: 'HTML',
                    }) // handler
            )
            .row()
    }
    return range
})

// Create the sub-menu that is used for rendering dishes
const dishText = (dish: string) => `<b>${dish}</b>\n\nYour rating:`
const dishMenu = new Menu<MyContext>('dish')
dishMenu.dynamic(ctx => {
    const dish = ctx.match
    if (typeof dish !== 'string') throw new Error('No dish chosen!')
    return createDishMenu(dish)
})
/** Creates a menu that can render any given dish */
function createDishMenu(dish: string) {
    return new MenuRange<MyContext>()
        .text(
            {
                text: ctx =>
                    ctx.session.favoriteIds.includes(dish) ? 'Yummy!' : 'Meh.',
                payload: dish,
            },
            ctx => {
                const set = new Set(ctx.session.favoriteIds)
                if (!set.delete(dish)) set.add(dish)
                ctx.session.favoriteIds = Array.from(set.values())
                ctx.menu.update()
            }
        )
        .row()
        .back({ text: 'X Delete', payload: dish }, async ctx => {
            const index = dishDatabase.findIndex(d => d.id === dish)
            dishDatabase.splice(index, 1)
            await ctx.editMessageText('Pick a dish to rate it!')
        })
        .row()
        .back({ text: 'Back', payload: dish })
}

mainMenu.register(dishMenu)

bot.use(mainMenu)

bot.command('start', ctx => ctx.reply(mainText, { reply_markup: mainMenu }))

bot.catch(console.error.bind(console))
bot.start()