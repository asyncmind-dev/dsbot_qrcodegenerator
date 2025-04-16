import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import SlashCommandI from "@interfaces/SlashCommandI";
import CustomClientI from "@interfaces/CustomClientI";

export default class Ping implements SlashCommandI {
    public readonly data = new SlashCommandBuilder().setName("pong").setDescription("Replies with pong!");
    public readonly active = true;
    public readonly cooldown = 10;
    
    public async execute(interaction: ChatInputCommandInteraction) {
        const client: CustomClientI = interaction.client as CustomClientI;
        await interaction.reply("Pong: " + client.ws.ping + "ms!");
    }
}