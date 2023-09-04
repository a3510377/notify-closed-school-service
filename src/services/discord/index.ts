import { Notify } from '../notify';
import { DiscordModel } from '@/database/discord';
import { TaiwanCityKeyType, TaiwanCitys } from '@/utils/variables';
import { CustomClient } from './client';

export const setup = (notify: Notify) => {
  const client = new CustomClient({ intents: [] });

  client.on('ready', async () => {
    console.log(`[Discord] Logging in as ${client.user?.tag}`);

    await client.resolveModules();
  });
  client.on('interactionCreate', async (interaction) => {
    const autocomplete = interaction.isAutocomplete();
    if (interaction.isAutocomplete() || interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.error(
          `[Discord] no command matching ${interaction.commandName} was found.`,
        );
        return;
      }

      if (autocomplete) {
        await command.autocomplete?.(client, interaction);
        return;
      }

      try {
        await command.execute(client, interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: '執行指令時發生錯誤',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: '執行指令時發生錯誤',
            ephemeral: true,
          });
        }
      }
    }
  });

  notify.on('closeInfo', async (data) => {
    for (const channel of await DiscordModel.find()) {
      const citys = channel.city.includes('*')
        ? Object.values(TaiwanCitys)
        : [...channel.city]
            .map((city) => TaiwanCitys[city.toUpperCase() as TaiwanCityKeyType])
            .filter((s, _, a) => a.includes(s));

      const text: string[] = [];
      for (const [summary, infos] of Object.entries(data)) {
        const info = citys
          .map((city) => infos[city])
          .filter(Boolean)
          .join('、');

        info && text.push(info + summary);
      }

      if (text.length) {
        client.channels
          .fetch(channel.channelID)
          .then((channel) => {
            if (channel?.isTextBased()) {
              channel.send(text.join('\n'));
            }
          })
          .catch((err) => {
            console.log(`[Discord] send -> ${channel.channelID} error ${err}`);
          });
      }
    }
  });

  return client;
};

export default setup;
