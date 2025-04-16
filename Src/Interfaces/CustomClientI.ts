import { Client, Collection } from "discord.js";

import SlashCommandI from "@interfaces/SlashCommandI";

export default interface CustomClientI extends Client {
    commands: Collection<string, SlashCommandI>;
    cooldowns: Collection<string, Collection<string, number>>;
}