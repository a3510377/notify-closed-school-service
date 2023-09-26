import {
  APIInteractionDataResolvedChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
  InteractionReplyOptions,
  InteractionUpdateOptions,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextChannel,
} from 'discord.js';

import { Command } from '.';
import {
  TaiwanCityKeyType,
  TaiwanCitys,
  TaiwanCitysDistributed,
  TaiwanPosition,
  TaiwanPositionKeyType,
} from '@/utils/variables';
import { DiscordModel, discordFindOrCreate } from '@/database/discord';
import { CustomClient } from '../client';
import { DeepPartial } from 'typeorm';

export const baseNotifyID = 'notify:command:';
export const baseSelectID = `${baseNotifyID}select:`;

const getChannelDB = async (
  channelId: string,
  guildId: string,
  updateData?: DeepPartial<DiscordModel>,
) => {
  const channelDb = await discordFindOrCreate(channelId, guildId);
  if (!channelDb) {
    throw new Error('Create chanel data error');
  }

  if (updateData) {
    return await DiscordModel.save(DiscordModel.merge(channelDb, updateData));
  }

  return channelDb;
};

const updateCommand = async (
  client: CustomClient,
  channelArg: TextChannel | APIInteractionDataResolvedChannel,
  updateData?: DeepPartial<DiscordModel>,
  selectView?: TaiwanPositionKeyType,
): Promise<InteractionReplyOptions & InteractionUpdateOptions> => {
  const channel = client.channels.cache.get(channelArg.id);
  if (!(channel instanceof TextChannel)) {
    throw new Error('Invalid channel');
  }

  const channelDb = await getChannelDB(channel.id, channel.guildId, updateData);

  const buttons = Object.entries(TaiwanPosition).map(([key, value]) =>
    new ButtonBuilder()
      .setCustomId(`${baseNotifyID}pos-${key}`)
      .setLabel(value)
      .setStyle(ButtonStyle.Primary),
  );
  const closeBtn = new ButtonBuilder()
    .setCustomId(`${baseNotifyID}off`)
    .setLabel('關閉')
    .setStyle(ButtonStyle.Danger);
  const allPosBtn = new ButtonBuilder()
    .setCustomId(`${baseNotifyID}all`)
    .setLabel('全部')
    .setStyle(ButtonStyle.Primary);

  allPosBtn.setDisabled(!!channelDb.city.includes('*'));

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    allPosBtn,
    closeBtn,
  );

  if (selectView) {
    const select = new StringSelectMenuBuilder().setCustomId(
      `${baseSelectID}${selectView}`,
    );
    const channelData = await getChannelDB(channel.id, channel.guildId);

    select.addOptions(
      TaiwanCitysDistributed[selectView].map((id) => {
        return new StringSelectMenuOptionBuilder()
          .setValue(id)
          .setLabel(TaiwanCitys[id])
          .setDefault(
            channelData?.city.includes('*') || channelData?.city.includes(id),
          );
      }),
    );
    select.setMaxValues(select.options.length);

    const row3 = new ActionRowBuilder<StringSelectMenuBuilder>();
    row3.addComponents(select);

    return { components: [row1, row2, row3], ephemeral: true };
  }

  return { components: [row1, row2], ephemeral: true };
};

const citysSelect = async (
  name: string,
  channelID: string,
): Promise<StringSelectMenuBuilder> => {
  const select = new StringSelectMenuBuilder().setCustomId(
    `${baseSelectID}${name}`,
  );
  const channelData = await DiscordModel.findOneBy({ channelID });

  select.addOptions(
    TaiwanCitysDistributed[name as TaiwanPositionKeyType].map((id) => {
      return new StringSelectMenuOptionBuilder()
        .setValue(id)
        .setLabel(TaiwanCitys[id])
        .setDefault(
          channelData?.city.includes('*') || channelData?.city.includes(id),
        );
    }),
  );
  select.setMinValues(0);
  select.setMaxValues(select.options.length);

  return select;
};

const command: Command = {
  builder: new SlashCommandBuilder()
    .setName('notify')
    .setDescription('設定停班停課通知')
    .addChannelOption((option) => {
      return option.setName('channel').setDescription('通知頻道');
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (client, interaction) => {
    const channel =
      interaction.options.getChannel('channel') ||
      (await client.channels.fetch(interaction.channelId));

    if (channel?.type !== ChannelType.GuildText) {
      return await interaction.reply({
        content: '頻道必須為文字頻道歐~~',
        ephemeral: true,
      });
    }

    const { id: channelID } = channel;
    const payload = await updateCommand(client, channel);
    const response = await interaction.reply({
      ...payload,
      content: '設定您所需要接收的訊息',
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
          const payload = await updateCommand(client, channel, { city: '*' });

          await i.update(payload);
        } else if (id.startsWith('pos-')) {
          const name = id.slice(4);
          if (!(name in TaiwanPosition)) {
            console.log('[Discord] invalid city id');
            return collector.stop();
          }

          const row3 = new ActionRowBuilder<StringSelectMenuBuilder>();
          row3.addComponents(await citysSelect(name, channelID));

          const { components } = await updateCommand(client, channel);
          await i.update({ components: [...(components || []), row3] });
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
      if (!i.customId.startsWith(baseSelectID) || !i.guildId) return;
      const id = i.customId.slice(baseSelectID.length) as TaiwanPositionKeyType;
      const channelData = await getChannelDB(i.channelId, i.guildId);

      let citys = channelData.city.includes('*')
        ? Object.keys(TaiwanCitys)
        : [...channelData.city];
      citys = citys.filter((v, _, list) => {
        return (
          !TaiwanCitysDistributed[id].includes(v as TaiwanCityKeyType) &&
          list.includes(v)
        );
      });
      citys.push(...i.values);
      if (citys.length >= Object.keys(TaiwanCitys).length) citys = ['*'];
      channelData.city = citys.join('');
      channelData.save();

      const { components } = await updateCommand(client, channel);
      const row3 = new ActionRowBuilder<StringSelectMenuBuilder>();
      row3.addComponents(await citysSelect(id, channelID));
      await i.update({ components: [...(components || []), row3] });
    });
  },
};
export default command;
