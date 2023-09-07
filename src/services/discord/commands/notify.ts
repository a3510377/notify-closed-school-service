import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

import { Command } from '.';
import { TaiwanPosition } from '@/utils/variables';
import { DiscordModel } from '@/database/discord';

const baseNotifyID = 'notify-command-';

const command: Command = {
  builder: new SlashCommandBuilder()
    .setName('notify')
    .setDescription('設定停班停課通知')
    .addChannelOption((option) => {
      return option.setName('channel').setDescription('通知頻道');
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (_, interaction) => {
    const channel =
      interaction.options.getChannel('channel') ||
      (await interaction.client.channels.fetch(interaction.channelId));

    if (channel?.type !== ChannelType.GuildText) {
      return await interaction.reply({
        content: '頻道必須為文字頻道歐~~',
        ephemeral: true,
      });
    }

    const buttons = Object.entries(TaiwanPosition).map(([key, value]) =>
      new ButtonBuilder()
        .setCustomId(`${baseNotifyID}pos-${key}`)
        .setLabel(value)
        .setStyle(ButtonStyle.Primary),
    );
    const allPosBtn = new ButtonBuilder()
      .setCustomId(`${baseNotifyID}pos-all`)
      .setLabel('全部')
      .setStyle(ButtonStyle.Primary);
    const closeBtn = new ButtonBuilder()
      .setCustomId(`${baseNotifyID}off`)
      .setLabel('關閉')
      .setStyle(ButtonStyle.Danger);

    const channelData = await DiscordModel.findOneBy({ channelID: channel.id });
    allPosBtn.setDisabled(channelData?.city.includes('*'));

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      allPosBtn,
      closeBtn,
    );

    const response = await interaction.reply({
      content: '設定您所需要接收的訊息',
      components: [row1, row2],
      ephemeral: true,
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 1e3 * 60,
    });

    collector
      .on('collect', async (i) => {
        if (!i.customId.startsWith(baseNotifyID)) return;
        const id = i.customId.substring(baseNotifyID.length);

        if (id === 'off') {
          await channelData?.remove();
          await interaction.editReply({
            content: `已關閉 <#${channel.id}> 停班停課通知`,
            components: [],
          });
          collector.stop();
        }
      })
      .on('end', async (_, reason) => {
        if (reason === 'time') {
          await interaction.editReply({
            content: '一分鐘內還未收到回應，關閉交互',
            components: [],
          });
        }
      });
  },
};
export default command;
