import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

import { Command } from '.';
import {
  TaiwanCitys,
  TaiwanCitysDistributed,
  TaiwanPosition,
  TaiwanPositionKeyType,
} from '@/utils/variables';
import { DiscordModel } from '@/database/discord';

export const baseNotifyID = 'notify:command:';
export const baseSelectID = `${baseNotifyID}select:`;

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
    const channelID = channel.id;

    const buttons = Object.entries(TaiwanPosition).map(([key, value]) =>
      new ButtonBuilder()
        .setCustomId(`${baseNotifyID}pos-${key}`)
        .setLabel(value)
        .setStyle(ButtonStyle.Primary),
    );
    const allPosBtn = new ButtonBuilder()
      .setCustomId(`${baseNotifyID}all`)
      .setLabel('全部')
      .setStyle(ButtonStyle.Primary);
    const closeBtn = new ButtonBuilder()
      .setCustomId(`${baseNotifyID}off`)
      .setLabel('關閉')
      .setStyle(ButtonStyle.Danger);

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      allPosBtn,
      closeBtn,
    );

    const channelData = await DiscordModel.findOneBy({ channelID });
    if (!channelData) {
      const channelData = new DiscordModel();

      channelData.channelID = interaction.channelId;
      channelData.guildID = interaction.guildId as string;

      await channelData.save();
    }

    allPosBtn.setDisabled(!!(channelData && channelData.city.includes('*')));

    const response = await interaction.reply({
      content: '設定您所需要接收的訊息',
      components: [row1, row2],
      ephemeral: true,
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 1e3 * 60,
    });
    const collectorSelect = response.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
    });

    collector
      .on('collect', async (i) => {
        if (!i.customId.startsWith(baseNotifyID)) return;
        const id = i.customId.substring(baseNotifyID.length);

        collector.resetTimer();
        if (id === 'off') {
          await DiscordModel.delete({ channelID });
          await interaction.editReply({
            content: `已關閉 <#${channel.id}> 停班停課通知`,
            components: [],
          });
          collector.stop();
        } else if (id === 'all') {
          allPosBtn.setDisabled(true);
          closeBtn.setDisabled(false);

          await i.update({ components: [row1, row2] });
        } else if (id.startsWith('pos-')) {
          const name = id.slice(4);
          if (!(name in TaiwanPosition)) {
            console.log('[Discord] invalid city id');
            return collector.stop();
          }

          const select = new StringSelectMenuBuilder().setCustomId(
            `${baseSelectID}${name}`,
          );

          select.addOptions(
            TaiwanCitysDistributed[name as TaiwanPositionKeyType].map((id) => {
              return new StringSelectMenuOptionBuilder()
                .setValue(id)
                .setLabel(TaiwanCitys[id]);
            }),
          );
          select.setMaxValues(select.options.length);

          const row3 = new ActionRowBuilder<StringSelectMenuBuilder>();
          row3.addComponents(select);

          await i.update({ components: [row1, row2, row3] });
        } else console.log(`[Discord] Invalid custom ID ${i.customId}`);
      })
      .on('end', async (_, reason) => {
        if (reason === 'time') {
          await interaction.editReply({
            content: '一分鐘內還未收到回應，關閉交互',
            components: [],
          });
        }

        collectorSelect.stop();
      });

    collectorSelect.on('collect', async (i) => {
      if (!i.customId.startsWith(baseSelectID)) return;
      // const id = i.customId.slice(baseSelectID.length);

      await i.update({ content: '', components: [row1, row2] });
      console.log(i.customId);
      console.log(i.values);
    });
  },
};
export default command;
