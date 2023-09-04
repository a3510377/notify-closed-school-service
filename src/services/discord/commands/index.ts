import {
  AutocompleteInteraction,
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { CustomClient } from '../client';

export interface Command {
  disabled?: boolean;
  builder: SlashCommandBuilder;
  autocomplete?: (
    client: CustomClient,
    interaction: AutocompleteInteraction<CacheType>,
  ) => unknown;
  execute: (
    client: CustomClient,
    interaction: ChatInputCommandInteraction<CacheType>,
  ) => unknown;
}

export default false;
