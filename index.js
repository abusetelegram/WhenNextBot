if (!process.env.BOT_TOKEN) {
    const path = require('path')
    const envpath = path.resolve(__dirname, '.env')
    require('dotenv').config({ path: envpath })
}

const dayjs = require('dayjs')
const getNow = () => dayjs()
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

const upcomming = async () => {
    const d = await loadData()
    let str = `最近有 ${d.length} 个促销\n`
    
    d.forEach(e => {
        str += `
促销事件：${d.title}
开始日期：${d.start.format("YYYY 年 MM 月 DD 日 h:mm:ss a")}
结束日期：${d.end.format("YYYY 年 MM 月 DD 日 h:mm:ss a")}
持续：${d.end.diff(d.start, 'day')} 天，约等于 ${round(d.end.diff(d.start, 'week', true))} 周
链接: ${d.link}
`
    })
}

const now = async () => {
    const d = await loadData()
    const n = getNow()
    if (n.isBetween(d[0].start, d[0].end)) {
        return '正是时候！ https://youtu.be/bUo1PgKksgw'
    }
    return '现在没促销，准备好钱包吧！'
}

const human = async () => {
    const d = await loadData()
    const n = getNow()
    if (n.isBetween(d.startDate, d.endDate, null, '[]')) {
        return `现在就在大促销好不好！${d.endDate.fromNow(false)}就要结束了，还不快买？`
    } else if (n.isBefore(g.StartDate)) {
        return `嘿，距离最近一次的大促销还有${d.startDate.toNow(false)}，钱包准备好了吗？`
    }
    
    return `好吧，大促销在${d.endDate.toNow()}就结束了。`
}


bot.start((ctx) => ctx.reply(`数据来源：https://steamdb.info/sales/history/
项目地址：https://github.com/abusetelegram/WhenNextBot
`))
bot.on('callback_query', (ctx) => ctx.answerCbQuery())
bot.command('now', async (ctx) => ctx.reply(await now()))
bot.command('when', async (ctx) => ctx.reply(await when()))
bot.command('human', async (ctx) => ctx.reply(await human()))
bot.on('inline_query', async (ctx) => {
  const res = [
      ['用激励性的话语让你的朋友剁手', await human()], 
      ['打印一些无聊的信息', await when()], 
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