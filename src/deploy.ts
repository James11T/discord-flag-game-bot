import "dotenv/config";
import { Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import { commands } from "./commands";

const { BOT_TOKEN, BOT_ID, GUILD_ID } = process.env;

if (!BOT_TOKEN) process.exit(-1);

const deployCommands = async () => {
  const rest = new REST({ version: "9" }).setToken(BOT_TOKEN);

  console.log("Deploying commands");
  const body = commands.map((cmd) => cmd.command.toJSON());
  const res = await rest.put(Routes.applicationGuildCommands(BOT_ID, GUILD_ID), {
    body
  });

  const count = Array.isArray(res) ? res.length : "unknown";

  console.log(`Deployed ${count} commands`);
};

deployCommands();
