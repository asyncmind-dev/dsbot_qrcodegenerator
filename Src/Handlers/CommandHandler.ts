import { ChatInputCommandInteraction, REST, Routes, SlashCommandBuilder } from "discord.js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();


import CustomClientI from "@interfaces/CustomClientI";
import SlashCommandI from "@interfaces/SlashCommandI";


export default class CommandHandler {
  private readonly commandsFolderPath: string = path.join(__dirname,"../","Commands");
  private readonly commands: SlashCommandBuilder[];
  private readonly client: CustomClientI;

  public constructor(client: CustomClientI) {
    this.client = client;
    this.commands = [];
  }

  //  This function returns an array of strings that are the Subfolders of the Commands folder (useful for an help command)
  private getSubfolders (): string[] {
    //  Getting the commands subfolders
    const commandSubfolders = fs.readdirSync(this.commandsFolderPath);
    return commandSubfolders;
  }

  //  This function registers the commands to the discord bot (in this case it's only in the guild provided)
  private async registerCommands(): Promise<void> {
    //  Checking if there is a TOKEN value inside the .env file
    if(!process.env.TOKEN)          throw new Error("Missing or invalid TOKEN value inside .env file.");
        //  Checking if there is an APPLICATION_ID value inside the .env file
    if(!process.env.APPLICATION_ID) throw new Error("Missing or invalid APPLICATION_ID value inside .env file.");
    //  Checking if there is a GUILD_ID value inside the .env file
    if(!process.env.GUILD_ID)       throw new Error("Missing or invalid GUILD_ID value inside .env file.");
    //  Instantiating the REST class and setting the bot token
    const rest = new REST().setToken(process.env.TOKEN);
    //  Registering the commands to the guild wich id has's been passed
    await rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID), {
        body: this.commands
    });

    //  Getting the registeredCommands in an array so the length can be logged
    const registeredCommands: any[] = await rest.get(Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID)) as any[];
    //  Console logging the number of registered commands
    console.log("Registered: " + registeredCommands.length + " commands.");
  }

  //  This function handlers all of the commmands handling logic
  public async handleCommands(): Promise<void> {
    //  Getting the commands subfolders from the function getSubfolders
    const commandSubfolders = this.getSubfolders();
    //  Looping through each subfolder
    for (const commandSubfolder of commandSubfolders) {

      //  Getting the current subfolder path
      const commandSubfolderPath = path.join(this.commandsFolderPath,commandSubfolder);
      //  Getting the command file names inside the current subfolder (commandname.ts)
      const commandFilenames = fs.readdirSync(commandSubfolderPath).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

      //  Looping through each command filename
      for (const commandFilename of commandFilenames) {
        //  Getting the current command file path
        const commandFilePath = path.join(this.commandsFolderPath,commandSubfolder,commandFilename);
        //  Importing the command class dynamically
        const commandClass = (await import(commandFilePath)).default;

        //  Checking if the commandClass was imported successfully
        if (!commandClass) {
          throw new Error("[--" +  commandFilename +  "--]" +  " There was an error while importing the class.");
        };

        // Creating a command instance and casting it to SlashCommandI
        const command = new commandClass() as SlashCommandI;

        //  Checking if the command is not active so it will be skipped
        if(!command.active) {
            console.log("Command: [--" + (commandFilename.slice(0,-3)).toUpperCase() + "--]" + " Skipped!");
            continue;
        };

        //  Checking if command data hasn't been set
        if(!command.data) {
            throw new Error("[--" +  commandFilename +  "--]" +  " No command data was provided.");
        };
        //  Checking if command name hasn't been set
        if(!command.data.name) {
            throw new Error("[--" +  commandFilename +  "--]" +  " No command name was provided.");
        };
        
        //  Checking if command description hasn't been set
        if(!command.data.description) {
            throw new Error("[--" +  commandFilename +  "--]" +  " No command description was provided.");
        };

        if(!command.cooldown) {
          command.cooldown = 3;
        }

        //  Making sure the arguments are passed to the command execute function
        const execute = (interaction: ChatInputCommandInteraction) => command.execute(interaction);
        
        //  Setting the commandname as the key and the command object as the value to the client commands collection
        this.client.commands.set(command.data.name, {
            data:       command.data,
            active:     command.active,
            cooldown:   command.cooldown,
            execute
        });
        //@ts-ignore
        //  Pushing inside the commands array the command data object as json format
        this.commands.push(command.data.toJSON());
      };
    };

    //  Registering the commands at the end
    await this.registerCommands();
    return;
  };
}
