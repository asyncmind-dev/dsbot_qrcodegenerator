import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

export default interface SlashCommandI {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  cooldown: number;
  active: boolean;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
