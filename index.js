const yaml = require('js-yaml')
const fs = require('fs')
const EventEmitter = require('events')
const tuff = new EventEmitter()
let commands = new Map()
let services = new Map()

let config
try {
  config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'))
} catch (e) {
  console.error(e)
  process.exit()
}

tuff.on('message', async (command, content, origin) => {
  console.log('tuff on message:')
  console.log(command, content, origin)
  let module = commands.get(command)
  if (module) {
    let response = await module.run(content)
    services.get(origin.service).respond(command, response, origin)
  }
})


// Load Services
if (!config.services) {
  console.log('No Services defined in config\nExiting...')
  process.exit()
}
let s = Object.keys(config.services)
console.log(s)

for (let i = 0; i < s.length; i++) {
  if (!config.services[s[i]].enabled) {
    console.log(`${s[i]} is not Enabled!`)
  } else {
    const module = require(`./services/${s[i]}.js`)
    module.start(config.services[s[i]], tuff)
    services.set(s[i], module)
  }
}

console.log(services)

// Load commands
fs.readdirSync('./commands').forEach(file => {
  if (file.endsWith('.js')) {
    let module = require('./commands/' + file)
    commands.set(file.replace('.js', ''), module)
    console.log('Loaded ', file)
  }
})

console.log(commands)
