import { Notify } from '../notify';
import { DiscordModel } from '@/database/discord';
import { TaiwanCityKeyType, TaiwanCitys } from '@/utils/variables';
import { CustomClient } from './client';
import { APIEmbedField, EmbedBuilder, Routes } from 'discord.js';

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
        console.error(`[Discord] execute command error ${error}`);
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

      const embeds: APIEmbedField[] = [];
      for (const [summary, infos] of Object.entries(data)) {
        const info = citys
          .map((city) => infos[city])
          .filter(Boolean)
          .join('、');

        info && embeds.push({ name: summary, value: info, inline: true });
      }

      // check fields
      if (embeds.length) {
        const embed = new EmbedBuilder()
          .setTitle('⚠️ 停班停課通知 ⚠️')
          .setColor(0xff0000 /* red */)
          .setFooter({
            text: '資料來源: https://www.dgpa.gov.tw/',
            iconURL: 'https://avatars.githubusercontent.com/u/70706886?v=4',
          })
          .setTimestamp()
          .addFields(embeds);

        client.rest
          .post(Routes.channelMessages(channel.channelID), {
            body: JSON.stringify(embed.toJSON()),
            headers: { 'Content-Type': 'application/json' },
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
