module.exports = {
  name: "boop",
  description: "beep",
  execute(message, args) {
    message.channel.send("Beep!");
  },
};
