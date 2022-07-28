const { readFile, writeFile } = require('node:fs/promises')
const dayjs = require('dayjs')
const timezone = require('dayjs/plugin/timezone')
const utc = require('dayjs/plugin/utc')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const duration = require('dayjs/plugin/duration')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
require('dayjs/locale/en')

const puppeteer = require('puppeteer-extra')
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const url = "https://steamdb.info/sales/history/";
const launchOpts = { 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars']
};
if (process.platform === "darwin") {
    launchOpts.executablePath = process.env['PUPPETEER_EXECUTABLE_PATH']
}

async function getData() {
    const browser = await puppeteer.launch(launchOpts)

    const page = await browser.newPage()
    await page.goto(url)
    const upcoming = await page.evaluate(() => {
        const panels = document.querySelector("#main .row").querySelectorAll(".panel-sale")
        const ls = []
        panels.forEach(e => {
            const img = e.querySelector('img').src
            const p = e.querySelector('.panel-body')
            const a = p.querySelector("a")
            const title = a.text
            const link = a.href
            const duration = p.querySelector("div").textContent.split(" — ")
            const start = duration[0]
            const end = duration[1]

            ls.push({
                img, title, link, start, end
            })
        })

        return ls
    });

    const current = await page.evaluate(() => {
        const panel = document.querySelector(".next-sale .container")
        const h2 = panel.querySelector("h2").textContent
        const unixtime = panel.querySelector('#js-sale-countdown').attributes['data-target'].nodeValue.slice(0, -3)
        if (h2 === "When is the next Steam sale?") {
            return {
                live: false,
                title: panel.querySelector('.sale-name').textContent,
                unixtime
            }
        } 
        
        return {
            live: true,
            title: h2,
            unixtime
        }
    });

    browser.close()
    
    return {
        upcoming, 
        current,
        operation_time: dayjs()
    }
}
/*
[
  {
    title: 'Steam VR Fest 2022',
    link: 'https://store.steampowered.com/news/group/4145017/view/3218394291609115017',
    start: '18 July 2022',
    end: '25 July 2022'
  },
  {
    title: 'Steam Survival Fest 2022',
    link: 'https://steamcommunity.com/groups/steamworks/announcements/detail/3222900587040657570',
    start: '1 August 2022',
    end: '8 August 2022'
  },
  {
    title: 'Next Fest: October 2022',
    link: 'https://steamcommunity.com/groups/store_promos/announcements/detail/3363641088446628992',
    start: '3 October 2022',
    end: '10 October 2022'
  }
]
*/

const cacheFileName = "cache.json"
const refreshHour = 23

async function fetchAndWrite() {
    const d = await getData()
    writeFile(cacheFileName, JSON.stringify({
        ...d,
        operation_time: d.operation_time.toJSON()
    }))
    return d
}

let cache = null

async function main() {
    if (!cache) {
        console.log("no cache present, getting data")
        cache = await readFile(cacheFileName).then(res => {
            const d = JSON.parse(res)
            d.operation_time = dayjs(d.operation_time)
            const diffhour = dayjs().diff(d.operation_time, 'hour')
            console.log(`Diff hour: ${diffhour}`)

            if (diffhour > refreshHour) {
                console.log("local cache expired, refetching...")
                return fetchAndWrite()
            }
            return d
        }).catch(e => {
            console.log("Unable to retrieve cache", e)
            return fetchAndWrite()
        })  
    } else {
        if (dayjs().diff(cache.operation_time, 'hour') > refreshHour) {
            console.log("cache expired, updating...")
            cache = await fetchAndWrite()
        }
    }



    return {
        current: {
            ...cache.current,
            time: dayjs.unix(cache.current.unixtime)
        },
        upcoming: cache.upcoming.map(e => {
            const start = dayjs(e.start, "D MMMM YYYY", "en")
            const end = dayjs(e.end, "D MMMM YYYY", "en")
            return {
                ...e,
                start, 
                end,
            }
        })
    }
}

module.exports = main

