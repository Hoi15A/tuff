const Discord = require('discord.js')
const client = new Discord.Client({ 'disableEveryone': true })

// TODO: figure out how I wanna do the channels shit or if I even implement it
// const channels = new Map()

exports.start = async (config, tuff) => {
  client.on('ready', () => {
    console.log(`Logged in on Discord as ${client.user.tag}!`)
  })

  client.on('message', async msg => {
    if (!msg.content.startsWith(config.prefix) || msg.author.bot) return

    let contents = msg.content.replace(config.prefix, '').split(' ')
    let command = contents.shift()
    contents = contents.join(' ')

    switch (command) {/*
      case 'joinChannel':
      case 'jc':

        break
      case 'leaveChannel':
      case 'lc':

        break */
      default:
        tuff.emit('runCommand', command, contents, {
          'service': 'discord',
          'message': msg
        })
    }
  })

  client.on('error', console.error)

  client.login(config.token)
}

exports.respond = async (command, response, origin) => {
  return origin.message.channel.send(response)
}
