import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import SlashCommandI from "@interfaces/SlashCommandI";
import CustomClientI from "@interfaces/CustomClientI";

export default class Hello implements SlashCommandI {
    public readonly data = new SlashCommandBuilder().setName("hello").setDescription("Replies with hello!");
    public readonly active = true;
    public readonly cooldown = 10;
    
    public async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply("Hello!");
    }
}