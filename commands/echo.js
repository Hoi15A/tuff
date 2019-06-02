exports.run = async (message) => {
  message = message.trim()
  if (message.length === 0) {
    return 'You need to actually give me shit to say'
  }
  return message
}
