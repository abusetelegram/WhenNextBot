
const loadData = require('./request')
const round = num => Math.round((num + Number.EPSILON) * 100) / 100

const upcoming = async () => {
    await loadData()
    await loadData()
    const { upcoming } = await loadData()
    let str = `即将有 ${upcoming.length} 个促销\n`
    
    upcoming.forEach(e => {
        str += `
促销事件：${e.title}
开始日期：${e.start.format("YYYY 年 MM 月 DD 日")}
结束日期：${e.end.format("YYYY 年 MM 月 DD 日")}
持续：${e.end.diff(e.start, 'day')} 天，约等于 ${round(e.end.diff(e.start, 'week', true))} 周
链接: ${e.link}
`
    })
    return str
}

(async() => {
    let t = await upcoming()
    console.log(t)
})()