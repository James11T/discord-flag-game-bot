import { SlashCommandBuilder } from "@discordjs/builders";
import { game, clearFlag } from "../game";
import type { CommandInteraction } from "discord.js";

const command = new SlashCommandBuilder().setName("skip").setDescription("Skip the current flag");

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
    content: `Skipped flag, it was \`${game.country}\``,
    ephemeral: false
  });

  clearFlag(false);
};

export { command, handler };
