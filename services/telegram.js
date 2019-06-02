const Telegraf = require('telegraf')

exports.start = async (config, tuff) => {
  const bot = new Telegraf(config.token)

  bot.hears(/^\/.+/, ctx => {
    let cmdEnt = ctx.update.message.entities.map(ent => {
      if (ent.type === 'bot_command') {
        return ent
      }
    })
    let command = ctx.update.message.text.substring(1, cmdEnt[0].length)
    let contents = ctx.update.message.text.substring(cmdEnt[0].length).trim()

    tuff.emit('message', command, contents, {
      'service': 'telegram',
      'ctx': ctx
    })
  })

  bot.catch(console.error)

  await bot.launch()
  console.log(`Polling on Telegram as ${bot.options.username} ID: ${bot.context.botInfo.id}`)
}

exports.respond = async (command, response, origin) => {
  return origin.ctx.replyWithMarkdown(response)
}
