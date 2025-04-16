import { Client, Collection, IntentsBitField } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import CustomClientI from "@interfaces/CustomClientI";
import EventHandler from "@handlers/EventHandler";
import CommandHandler from "@handlers/CommandHandler";

export default class Bot {
    private client: CustomClientI;
    private eventHandler: EventHandler;
    private commandHandler: CommandHandler;
    public constructor() {
        this.client = new Client({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMembers
            ]
        }) as CustomClientI;
        this.client.cooldowns = new Collection();
        this.client.commands = new Collection();
        this.eventHandler = new EventHandler(this.client);
        this.commandHandler = new CommandHandler(this.client);
    }

    public async start(): Promise<void> {
        this.client.login(process.env.TOKEN);
        await this.eventHandler.handleEvents();
        await this.commandHandler.handleCommands();
    }
}