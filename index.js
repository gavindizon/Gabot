const fs = require("fs");
const Discord = require("discord.js");

require("dotenv").config();

const gabot = new Discord.Client();
gabot.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  gabot.commands.set(command.name, command);
}
var server;
gabot.on("ready", (m) => {
  server = gabot.guilds.cache.get("274436634823491584");
  gabot.user.setActivity("Genshin Impact", { type: "PLAYING" });
});

gabot.on("message", async (message) => {
  if (message.content.startsWith(process.env.PREFIX + "rolelist")) {
    const Members = message.guild.members.cache.map((member) => {
      return member.user.username;
    });

    message.channel.send(`Users: ${Members}`);
  }
});
gabot.on("message", (message) => {
  if (!message.content.startsWith(process.env.PREFIX) || message.author.bot)
    return;

  const args = message.content
    .slice(process.env.PREFIX.length)
    .trim()
    .split(/ +/);
  const command = args.shift().toLowerCase();

  if (!gabot.commands.has(command)) return;

  try {
    gabot.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

gabot.login(process.env.DISCORD_TOKEN);
