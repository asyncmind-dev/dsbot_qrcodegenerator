# 📦 Discord QRBot

A modular, TypeScript-based Discord bot featuring:

- 🧠 Command handling
- ⌛ Cooldown system
- ⚡ Event handling
- 📷 `/generateqr` command that generates QR codes

---

## 📁 Project Structure

```
src/
│
├── Commands/               # Organized by category
│   ├── Utility/
|   |   ├── Hello.ts  
│   |   └── QR.ts
│   └── Miscellaneous
|       └── Ping.ts
│
├── Events/                 # Discord event listeners (e.g., ready, interactionCreate)
│   └── interactionCreate.ts
│
├── Handlers/
│   ├── CommandHandler.ts   # Handles command loading & registration
│   └── EventHandler.ts     # Handles dynamic event loading
│
├── Interfaces/             # Type definitions and interfaces
│   ├── SlashCommandI.ts
│   └── EventI.ts
│
└── index.ts                # Bot entry point
```

---

## 🚀 Features

### ✅ Command Handling

- Commands are grouped in subfolders inside `/Commands`.
- Uses `SlashCommandBuilder` to define slash commands.
- Dynamically loads and registers all commands to a specific guild.

### ⌛ Cooldown System

- Each command can define a `cooldown` in seconds.
- Cooldowns are enforced per-user to prevent spam.
- Users are notified if they attempt to use a command during cooldown.

### ⚙️ Event Handling

- Auto-loads events from `/Events`.
- Supports both one-time (`once`) and persistent (`on`) events.
- Allows toggling events with an `active` flag.

### 📷 QR Generator Command

- `/generateqr` command takes a URL and returns a QR code image.
- Lets users pick a size: small, medium, or large.
- Powered by `https://api.qrserver.com`.

---

## 🔧 Setup

1. **Clone the repo:**

   ```bash
   git clone https://github.com/asyncmind-dev/discord-qrbot.git
   cd discord-qrbot
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file:

   ```env
   TOKEN=your_discord_bot_token
   APPLICATION_ID=your_application_id
   GUILD_ID=your_test_guild_id
   ```

4. **Run the bot:**

   ```bash
   npm run dev
   ```

---

## 🧪 Example QR Generator Command

Example `/Commands/Utility/QR.ts`:

```ts
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
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("size")
        .setDescription("The size of the output qr code.")
        .addChoices(
          { name: "sm", value: 150 },
          { name: "md", value: 250 },
          { name: "lg", value: 350 }
        )
        .setRequired(true)
    );

  public readonly active = true;
  public readonly cooldown = 20;

  public async execute(interaction: ChatInputCommandInteraction) {
    const url = interaction.options.getString("url");
    const size = interaction.options.getInteger("size");

    if (!url) {
      interaction.reply({ content: "Please provide an url.", flags: MessageFlags.Ephemeral });
      return;
    }

    if (!size) {
      interaction.reply({ content: "Please choose a size.", flags: MessageFlags.Ephemeral });
      return;
    }

    try {
      const qrcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
      const response = await fetch(qrcodeUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      interaction.reply({
        files: [{ attachment: buffer, name: "qrcode.png" }],
      });
    } catch (error) {
      interaction.reply({ content: "Something went wrong. Try again.", flags: MessageFlags.Ephemeral });
    }
  }
}
```

---

## 🧠 Technologies Used

- [discord.js](https://discord.js.org/)
- [TypeScript](https://www.typescriptlang.org/)
- Node.js `fs`, `path`, and dynamic imports for modular handling

---

## 🛠️ Future Improvements

- Global cooldown tracking
- Dynamic help command generation
- Error logging system
- Role-based access to commands

---

## 📄 License

This project is dedicated to the public domain.
You may use, modify, and distribute it freely without any restrictions.

