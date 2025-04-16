import {
  ChatInputCommandInteraction,
  Collection,
  Events,
  Interaction,
  MessageFlags,
} from "discord.js";

//  Importing the interfaces
import CustomClientI from "@interfaces/CustomClientI";
import EventI from "@interfaces/EventI";
import SlashCommandI from "@interfaces/SlashCommandI";

export default class Ready implements EventI {
  public readonly name = Events.InteractionCreate;
  public readonly once = false;
  public readonly active = true;

  /**
   * Handles user cooldowns for slash commands.
   * Prevents a user from executing a command before their cooldown period expires.
   */
  private async handleCooldown(
    interaction: ChatInputCommandInteraction,
    client: CustomClientI,
    command: SlashCommandI,
    commandName: string,
    userId: string
  ): Promise<void> {
    //  Getting the current time
    const now = Date.now();
    //  Getting the cooldowns collection
    const cooldowns = client.cooldowns;
    //  Getting the cooldown of the command
    const cooldown = command.cooldown;

    //  Checking if there are already cooldowns for the current command
    if (!cooldowns.has(commandName)) {
      //  Setting a new Collection to the current command
      cooldowns.set(commandName, new Collection());
    }

    //  Getting the cooldown collection that the user has for this command
    const timestamps = cooldowns.get(commandName) as Collection<string, number>;
    //  Getting the cooldown value that the user has for this command
    const lastUsed = timestamps.get(userId) as number;

    //  Checking if the user hadn't a cooldown on this command
    if (!lastUsed) {
      timestamps.set(userId, now);
      await command.execute(interaction);
      return;
    }

    //  Checking if the user had a cooldown on this command
    if (lastUsed) {
      //  Getting the time of expiration of the cooldown
      const expirationTime = lastUsed + cooldown * 1000;

      //  Checking if the current time is before the expiration time
      if (now < expirationTime) {
        //  Getting the expiration time timestamp (useful to tell the user how much seconds he needs to wait)
        const expirationTimestamp = Math.round((expirationTime - now) / 1000);
        interaction.reply({
          content:
            "Please wait you are on cooldown, you can use this command again in " +
            expirationTimestamp +
            " seconds.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      //  Setting the user cooldowns collection to the currentTime
      timestamps.set(userId, now);
      //  Executing the command
      await command.execute(interaction);
      return;
    }
    return;
  }

  public async execute(interaction: Interaction): Promise<void> {
    //  Checking if the interaction is a chat input command (/commandname)
    if (!interaction.isChatInputCommand()) return;
    //  Getting the client from the interaction
    const client: CustomClientI = interaction.client as CustomClientI;
    //  Getting the commands collection
    const commands = client.commands;
    //  Getting the commandname
    const commandName = interaction.commandName;
    //  Getting the commandbody from the collection with the commandname
    const command = commands.get(commandName);
    //  Getting the id of the user who ran the command (needed for the cooldowns)
    const userId = interaction.user.id;

    //  Checking if there is a command name
    if (!commandName) {
      interaction.reply({
        content: "Something went wrong. Try again.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    //  Cheking if there is a command
    if (!command) {
      interaction.reply({
        content: "This command doesn't exist.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    //  Checking if there is a userId
    if (!userId) {
      interaction.reply({
        content: "Something went wrong. Try again.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await this.handleCooldown(
      interaction,
      client,
      command,
      commandName,
      userId
    );
    return;
  }
}
