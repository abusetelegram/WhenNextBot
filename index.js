if (!process.env.BOT_TOKEN) {
    const path = require('path')
    const envpath = path.resolve(__dirname, '.env')
    require('dotenv').config({ path: envpath })
}

const dayjs = require('dayjs')
const round = num => Math.round((num + Number.EPSILON) * 100) / 100
const isBetween = require('dayjs/plugin/isBetween')
const relativeTime = require('dayjs/plugin/relativeTime')
require('dayjs/locale/zh-cn')

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)
dayjs.extend(isBetween)

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

const loadData = require('./request')

const upcoming = async () => {
    const { upcoming } = await loadData()
    let str = `即将有 ${upcoming.length} 个促销\n`
    
    upcoming.forEach(e => {
        str += `促销事件：${e.title}
开始日期：${e.start.format("YYYY 年 MM 月 DD 日 h:mm:ss a")}
结束日期：${e.end.format("YYYY 年 MM 月 DD 日 h:mm:ss a")}
持续：${e.end.diff(e.start, 'day')} 天，约等于 ${round(e.end.diff(e.start, 'week', true))} 周
链接: ${e.link}
${e.isMajorSale ? "**注意：这是个大促销！**" : ""}
`
    })
    return str
}

const now = async () => {
    const { current } = await loadData()

    if (current.live) {
        return `${current.title} 正是时候 https://youtu.be/bUo1PgKksgw`
    }
    return '现在没促销，准备好钱包吧！'
}

const human = async () => {
    const { current } = await loadData()

    if (current.live) {
        return `现在就在大促销好不好！${current.time.fromNow(false)}就要结束了，还不快买？`
    } else {
        return `嘿，距离最近一次的大促销 ${current.title} 还有 ${current.time.toNow(true)}，钱包准备好了吗？`
    }
}


bot.start((ctx) => ctx.reply(`数据来源：https://steamdb.info/sales/history/
项目地址：https://github.com/abusetelegram/WhenNextBot
`))
bot.on('callback_query', (ctx) => ctx.answerCbQuery())
bot.command('now', async (ctx) => ctx.reply(await now()))
bot.command('upcoming', async (ctx) => ctx.reply(await upcoming()))
bot.command('human', async (ctx) => ctx.reply(await human()))
bot.on('inline_query', async (ctx) => {
  const res = [
      ['用激励性的话语让你的朋友剁手', await human()], 
      ['查看一下即将到来的钱包忌日', await upcoming()], 
      ['现在是时候了吗？', await now()]
    ]
    const result = res.map(e => {
        return {
            type: 'article',
            id: `${e[0]}${Date.now()}`,
            title: e[0],
            description: e[1].substring(0,30),
            input_message_content: {
              message_text: e[1]
            }
        }
    })
  // Using shortcut
  ctx.answerInlineQuery(result)
})

module.exports = bot
