const yaml = require('js-yaml')
const fs = require('fs')
require('colors')
const EventEmitter = require('events')
const tuff = new EventEmitter()
let commands = new Map()
let aliases = new Map()
let services = new Map()

let config
try {
  config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'))
} catch (e) {
  console.error(e)
  process.exit()
}

console.log('Starting tuff!\n'.rainbow.underline)

tuff.on('runCommand', async (command, content, origin) => {
  // console.log('tuff on message:')
  // console.log(command, content, origin)
  let module = commands.get(command)

  // check for aliases if no command is found
  if (!module) {
    let alias = aliases.get(command)
    if (alias) {
      module = commands.get(alias)
    }
  }

  if (module) {
    let response = await module.run(content)
    services.get(origin.service).respond(command, response, origin)
  }
})


// Load Services
console.log('Loading services'.underline.blue)
if (!config.services) {
  console.log('No Services defined in config\nExiting...')
  process.exit()
}
let s = Object.keys(config.services)

for (let i = 0; i < s.length; i++) {
  if (!config.services[s[i]].enabled) {
    console.log(`${s[i]} is disabled`.red)
  } else {
    const module = require(`./services/${s[i]}.js`)
    module.start(config.services[s[i]], tuff)
    services.set(s[i], module)
    console.log(`Loaded ${s[i]}`.green)
  }
}

// Load commands
console.log('\nLoading commands'.underline.blue)
fs.readdirSync('./commands').forEach(file => {
  if (file.endsWith('.js')) {
    let module = require('./commands/' + file)
    let commandName = file.replace('.js', '')

    commands.set(commandName, module)
    console.log(`Loaded ${file}`.green)

    if (module.aliases && module.aliases.length > 0) {
      for (var i = 0; i < module.aliases.length; i++) {
        aliases.set(module.aliases[i], commandName)
      }
      console.log(`${commandName} aliases registered: ${module.aliases.join(', ')}`.cyan.italic)
    }
  }
})
console.log('\nCommand and service setup complete!\n'.magenta.underline)
