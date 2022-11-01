import { setFlag, game, newGame } from "../game";
import { SlashCommandBuilder } from "@discordjs/builders";
import { codeToImage, randomCountryCode } from "../countries";
import type { CommandInteraction } from "discord.js";

const command = new SlashCommandBuilder().setName("flag").setDescription("Guess a flag");

const handler = async (interaction: CommandInteraction) => {
  if (!interaction.channel) return;

  return newGame(interaction);
};

export { command, handler };
