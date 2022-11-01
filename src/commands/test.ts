import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import { getClosestCountry } from "../game.js";

const command = new SlashCommandBuilder()
  .setName("closest")
  .setDescription("Return the closest country")
  .addStringOption((option) =>
    option.setName("country").setDescription("Country").setRequired(true)
  ) as SlashCommandBuilder;

const handler = async (interaction: CommandInteraction) => {
  if (!interaction.channel) return;

  const country = interaction.options.get("country")?.value;

  if (!country) {
    await interaction.reply({ content: "Bad paramter", ephemeral: true });
    return;
  }

  const [closest, similarity] = getClosestCountry(String(country));
  const similarityPercentage = Math.round(similarity * 10000) / 100;

  await interaction.reply({
    content: `I have \`${similarityPercentage}%\` confidence that the closest country is \`${closest}\``,
    ephemeral: false
  });
};

export { command, handler };
