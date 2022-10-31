import { SlashCommandBuilder } from "@discordjs/builders";
import { game, clearFlag } from "../game";
import type { CommandInteraction } from "discord.js";

const command = new SlashCommandBuilder().setName("code").setDescription("Get the country code for the current flag");

const handler = async (interaction: CommandInteraction) => {
  if (!interaction.channel) return;

  if (!game.active) {
    await interaction.reply({
      content: `There currently not an active game.`,
      ephemeral: true
    });
    return;
  }

  await interaction.reply({
    content: `The current flags country code is \`${game.country}\``,
    ephemeral: false
  });
};

export { command, handler };
