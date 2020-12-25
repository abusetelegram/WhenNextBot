const bot = require('./index')

module.exports = async function(ctx) {
    bot.handleUpdate(ctx.request.body, ctx.response); // make Telegraf process that data
}
  