var moment = require('moment');

function readData() {
    fs = require('fs');
    return fs.readFileSync("./data.txt", 'utf8')
}
// Steam Tools
var DateUtils = {
    getMonthName: function (a) {
        var b = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        return b[a]
    },
    getWeekString: function (a, b, c) {
        var d = "";
        if (7 != a) {
            var e = Math.floor(b % 7);
            e > 0 && (d += "大约 "), e >= 3 && 5 > e && (c += .5, d += this.appendTime(c + ".5", "week", ", ")), e >= 5 && (c += 1), d += this.appendTime(c, "周")
        }
        return d
    },
    getTimeString: function (a, b, c) {
        return StringUtils.pad(a, 2) + ":" + StringUtils.pad(b, 2) + ":" + StringUtils.pad(c, 2)
    },
    appendTime: function (a, b, c) {
        void 0 == c && (c = "");
        var d = "";
        return a > 0 && (d += "**" + a + "**" + b, a >= 2 && (d += "s"), d += c), d
    },
    getTime: function (a) {
        var b = a / 1e3,
            c = b / 60,
            d = c / 60,
            e = d / 24,
            f = e / 7,
            g = {
                totalSeconds: b,
                totalMinutes: c,
                totalHours: d,
                totalDays: e,
                totalWeeks: f,
                seconds: Math.floor(b % 60),
                minutes: Math.floor(c % 60),
                hours: Math.floor(d % 24),
                days: Math.floor(e),
                weeks: Math.floor(f)
            };
        return g
    }
},
    StringUtils = {
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
            var e = new Date(b),
                f = new Date(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate(), e.getHours())),
                g = new Date(c),
                h = new Date(Date.UTC(g.getFullYear(), g.getMonth(), g.getDate(), g.getHours()));
            return {
                name: a,
                date: f,
                enddate: h,
                isConfirmed: d
            }
        }
    };

// Begin
var b = readData()
console.log(b)
var main = new SteamSales()
g = main.ParseSale(b)
var name = g.name
var date = g.date.getFullYear() + ' 年' + DateUtils.getMonthName(g.date.getMonth()) + " " + g.date.getDate() + "日";
var confirm = g.isConfirmed ? "已经确认" : "尚未确认";
var now = moment([])

console.log(date)