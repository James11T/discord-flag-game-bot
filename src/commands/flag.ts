import { SlashCommandBuilder } from "@discordjs/builders";
import countries, { codeToImage, randomCountryCode } from "../countries";
import { setFlag, game } from "../game";
import type { CommandInteraction } from "discord.js";

const command = new SlashCommandBuilder().setName("flag").setDescription("Guess a flag");

const handler = async (interaction: CommandInteraction) => {
  if (!interaction.channel) return;

  if (game.active) {
    if (!game.channel) return;

    await interaction.reply({
      content: `Sorry, there is already an active game.`,
      ephemeral: true
    });
    return;
  }

  const countryCode = randomCountryCode();
  const flag = codeToImage(countryCode);

  setFlag(interaction.channel, countries[countryCode]);

  await interaction.reply({
    content: "What country / region does this flag belong to?",
    files: [flag],
    ephemeral: false
  });
};

export { command, handler };
