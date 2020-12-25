const got = require('got')
const cheerio = require('cheerio')
const dayjs = require('dayjs')
const timezone = require('dayjs/plugin/timezone')
const utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
dayjs.extend(timezone)

/*
EndDate: "2021-01-02T18:00:00"
FirstDay: 2
IsConfirmed: false
LastDay: 6
Length: 11
Name: "Holiday Sale"
RemainingTime: "00:00:00"
StartDate: "2020-12-22T18:00:00"
*/
module.exports = async function() {
    const source = await got('https://www.whenisthenextsteamsale.com')
    const $ = cheerio.load(source.body)
    const v = $('#hdnNextSale').attr('value')
    const res = JSON.parse(v)
    return {
        endDate: dayjs.tz(res.EndDate, "America/New_York"),
        startDate: dayjs.tz(res.StartDate, "America/New_York"),
        isComfirmed: res.IsConfirmed,
        name: res.Name
    }
}