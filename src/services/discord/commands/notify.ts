import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import { Command } from '.';

const command: Command = {
  builder: new SlashCommandBuilder()
    .setName('notify')
    .setDescription('設定停班停課通知')
    .addChannelOption((option) => {
      return option.setName('channel').setDescription('通知頻道');
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (_, interaction) => {
    await interaction.reply('Not implemented');
  },
};
export default command;
