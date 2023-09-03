import { Client } from 'discord.js';

const client = new Client({ intents: [] });

client.on('ready', () => {
  console.log(`Logging in as ${client.user?.tag}`);
  client.guilds.cache.get('')?.edit({});
});

client.login(process.env.DISCORD_TOKEN);
