import Bot from "@classes/Bot";

const bot = new Bot();

async function startBot() {
    await bot.start();
}

startBot();
