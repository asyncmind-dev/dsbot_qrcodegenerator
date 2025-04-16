import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

import SlashCommandI from "@interfaces/SlashCommandI";

export default class Qr implements SlashCommandI {
  public readonly data = new SlashCommandBuilder()
    .setName("generateqr")
    .setDescription("Generates a qr code!")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("The url that the qrcode will redirect to.")
    )
    .addIntegerOption((option) =>
      option
        .setName("size")
        .setDescription("The size of the output qr code.")
        .addChoices(
          {
            name: "sm",
            value: 150,
          },
          {
            name: "md",
            value: 250,
          },
          {
            name: "lg",
            value: 350,
          }
        )
    );
  public readonly active = true;
  public readonly cooldown = 20;

  public async execute(interaction: ChatInputCommandInteraction) {
    //  Getting the url that's been given by the user
    const url = interaction.options.getString("url");
    //  Getting the size that's been chosen by the user
    const size = interaction.options.getInteger("size");

    //  Checking if the user provided an url
    if (!url) {
      interaction.reply({content: "Please provide an url.", flags: MessageFlags.Ephemeral});
      return;
    }

    //  Checking if the user chose a size
    if (!size) {
      interaction.reply({content: "Please choose a size.", flags: MessageFlags.Ephemeral});
      return;
    }

    try {
        //  Creating the url for the api that will return us the qrcode (setting custom size and url)
        const qrcodeUrl = ("https://api.qrserver.com/v1/create-qr-code/?size=" + size + "x" + size +"&data=" + encodeURIComponent(url));
        //  Getting the response from the api
        const response = await fetch(qrcodeUrl);
        //  Buffering the response
        const buffer = Buffer.from(await response.arrayBuffer());

        //  Replying with the qrcode as a .png file
        interaction.reply({
            files: [
                {
                    attachment: buffer,
                    name: "qrcode.png"
                }
            ]
        });
    } catch (error) {
        //  In case something went wrong replying with a warning
        interaction.reply({content: "Something went wrong. Try again.", flags: MessageFlags.Ephemeral});
    }
  }
}
