import { newGame } from "../game.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";

const command = new SlashCommandBuilder().setName("flag").setDescription("Guess a flag");

const handler = async (interaction: CommandInteraction) => {
  if (!interaction.channel) return;

  return newGame(interaction);
};

export { command, handler };
