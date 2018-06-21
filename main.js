const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '473454313:AAFeHyF8W_ZbrvKlI-CyukjrTNQHuBAKzTg';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (error) => {
    console.error(error.code);  // => 'EFATAL'
});

function readData() {
    fs = require('fs');
    return fs.readFileSync("./data.txt", 'utf8')
}

// Matches "/echo [whatever]"
bot.onText(/\/start/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, "数据来源：https://www.whenisthenextsteamsale.com");
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.onText(/\/when/, (msg) => {
    const chatId = msg.chat.id;

    // Begin
    var b = readData()

    var main = new SteamSales()
    g = main.ParseSale(b)
    
    bot.sendMessage(chatId, when(g), {
        parse_mode: "markdown"
    });
});

function round(number){
    return Math.round(number * 100) / 100
}

function when(g){
    var name = g.name
    var confirm = g.isConfirmed ? "已经确认" : "尚未确认";
    var result = '促销事件：' + name + '\r\n'
        + '开始日期：' + g.StartDate.format("YYYY 年 MM 月 DD 日 h:mm:ss a") + '\r\n'
        + '结束日期：' + g.EndDate.format('YYYY 年 MM 月 DD 日 h:mm:ss a') + '\r\n'
        + '持续：' + g.EndDate.diff(g.StartDate, 'days') + '天，约 ' + round(g.EndDate.diff(g.StartDate, 'weeks', true)) + ' 周' + '\r\n'
        + '状态：' + confirm
    return result
}

bot.onText(/\/now/, (msg => {

    // Begin
    var b = readData()
    var main = new SteamSales()
    var g = main.ParseSale(b)
    

    const chatId = msg.chat.id;

    bot.sendMessage(chatId, now(g))
}))

function now(g){
    var r = ''
    if (g.now.isBetween(g.StartDate, g.EndDate)) {
        r = '正是时候！ https://youtu.be/bUo1PgKksgw'
    } else {
        r = '现在没促销，准备好钱包吧'
    }
    return r
}

bot.onText(/\/human/, (msg => {
   
    // Begin
    var b = readData()
    var main = new SteamSales()
    var g = main.ParseSale(b)
   

    const chatId = msg.chat.id;

    bot.sendMessage(chatId, human(g))
}))

function human(g){
    var r = ''
    if (g.now.isBetween(g.StartDate, g.EndDate)) {
        if (g.EndDate.diff(g.now, 'days') <= 1){
            r = '现在就在大促销好不好！还有 ' + g.EndDate.diff(g.now, 'hours') + ' 小时就要结束了，还不快买？'
        }else{
            r = '现在就在大促销好不好！还有 ' + g.EndDate.diff(g.now, 'days') + ' 天就要结束了，还不快买？'
        }
    } else if (g.now.isBefore(g.StartDate)) {
        if (g.StartDate.diff(g.now, 'days') <= 1){
            r = '嘿，距离最近一次的大促销还有 ' + g.StartDate.diff(g.now, 'hours') + ' 小时，钱包准备好了吗？'
        }else{
            r = '嘿，距离最近一次的大促销还有 ' + g.StartDate.diff(g.now, 'days') + ' 天，钱包准备好了吗？'
        }
    } else {
        if (g.now.diff(g.EndDate, 'days') <= 1){
             r = '好吧，大促销在 ' + g.now.diff(g.EndDate, 'hours') + ' 小时前就结束了。'
        }else{
            r = '好吧，大促销在 ' + g.now.diff(g.EndDate, 'days') + ' 天前就结束了。'
        }
    }
    return r
}

bot.on('inline_query', function (msg) {
    console.log('inline mode')

     // Begin
     var b = readData()
     var main = new SteamSales()
     var g = main.ParseSale(b) 

    var a = function (type, text) {
        return {
            type: 'article',
            id: Date.now()+Date().milliseconds+type,
            title: type,
            message_text: text
        }
    }
    bot.answerInlineQuery(msg.id, [
        a('用激励性的话语让你的朋友剁手', human(g)),
        a('打印一些无聊的信息', when(g)),
        a('现在是时候了吗？', now(g))
    ])
});



// Steam Tools
var StringUtils = {
    pad: function (a, b, c) {
        return (void 0 == c || null == c) && (c = "0"), a += "", a.length >= b ? a : new Array(b - a.length + 1).join(c) + a
    }
},
    SteamSales = function () {
        this.ParseSale = function (b) {
            var c = JSON.parse(b);
            return a(c.Name, c.StartDate, c.EndDate, c.IsConfirmed)
        };
        var a = function (a, b, c, d) {
            var moment = require('moment');
            moment.locale('zh-cn');
            var e = new Date(b),
                f = new Date(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate(), e.getHours())),
                g = new Date(c),
                h = new Date(Date.UTC(g.getFullYear(), g.getMonth(), g.getDate(), g.getHours()));
            return {
                name: a,
                date: f,
                enddate: h,
                isConfirmed: d,
                StartDate: moment(f),
                EndDate: moment(h),
                now: moment()
            }
        }
    };