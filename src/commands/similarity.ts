import { SlashCommandBuilder } from "@discordjs/builders";
import { compareTwoStrings } from "string-similarity";
import config from "../config.js";
import type { CommandInteraction } from "discord.js";

const command = new SlashCommandBuilder()
  .setName("similarity")
  .setDescription("Return the similarity of two strings")
  .addStringOption((option) => option.setName("value1").setDescription("Value 1").setRequired(true))
  .addStringOption((option) =>
    option.setName("value2").setDescription("Value 2").setRequired(true)
  ) as SlashCommandBuilder;

const handler = async (interaction: CommandInteraction) => {
  if (!interaction.channel) return;

  const value1 = interaction.options.get("value1")?.value;
  const value2 = interaction.options.get("value2")?.value;

  if (!value1 || !value2) {
    await interaction.reply({
      content: "Failed to check similarity",
      ephemeral: true
    });
    return;
  }

  const similarity = compareTwoStrings(String(value1), String(value2));
  const similarityPercentage = Math.round(similarity * 10000) / 100;

  const message =
    similarity >= config.SIMILARITY_THRESHOLD
      ? "This **is** high enough to pass as correct."
      : "This **is not** high enough to pass as correct.";

  await interaction.reply({
    content: `I have \`${similarityPercentage}%\` confidence that \`${value1}\` and \`${value2}\` are the same. ${message}`,
    ephemeral: false
  });
};

export { command, handler };
