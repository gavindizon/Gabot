const fs = require("fs");

const timestamp = require("unix-timestamp");
const { Client, Intents, Collection } = require("discord.js");
const intents = new Intents([
  Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
  "GUILD_MEMBERS", // lets you request guild members (i.e. fixes the issue)
  "GUILD_PRESENCES",
]);

require("dotenv").config();

const gabot = new Client({ ws: { intents } });
gabot.commands = new Collection();
var server;
var tc;

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  gabot.commands.set(command.name, command);
}

gabot.on("ready", (m) => {
  server = gabot.guilds.cache.get("274436634823491584");
  gabot.user.setActivity("Genshin Impact", { type: "PLAYING" });

  server.members.fetch().then(console.log).catch(console.error);
  tc = server.channels.cache.get("778913513371992064");
  //tc.send("I am Online!");

  //server.channels.create("Bot-created Channel").catch(console.error);
});

gabot.on("message", async (message) => {
  if (message.content.startsWith(process.env.PREFIX + "rolelist")) {
    const Members = server.members.cache.map((member) => {
      return member.user.username;
    });

    message.channel.send(`Users: ${Members}`);
  }
});
gabot.on("presenceUpdate", (oldPresence, newPresence) => {
  // When User switches to online and no activities
  // console.log("OP\n\n\n");
  // console.log(oldPresence.guild.jop);
  // console.log("NP\n\n\n");
  // console.log(newPresence);
  if (newPresence.status === "offline" && oldPresence.activities.length === 0) {
    return;
  }

  console.log("Test Check2");

  // If naglaro ka
  if (newPresence.activities.length > 0 && newPresence.status === "online") {
    tc.send(
      `<@${
        newPresence.user.id
      }> is now **${newPresence.activities[0].type.toLowerCase()}** ${
        newPresence.activities[0].name
      }`
    );
  } else {
    const sTime = new Date(oldPresence.activities[0].createdTimestamp);
    const eTime = new Date(Date.now());
    console.log(sTime);
    console.log(eTime);
    const elapsed = Math.abs(eTime - sTime) / 36e5;

    tc.send(
      `<@${
        oldPresence.user.id
      }> stopped **${oldPresence.activities[0].type.toLowerCase()}** ${
        oldPresence.activities[0].name
      }
        \n Wow! That's a Total of ${elapsed} hours`
    );
  }

  return;
});

gabot.on("guildMemberUpdate", (oldMember, newMember) => {
  tc.send("Someone Updated shit");
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
