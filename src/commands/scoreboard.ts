import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import { getMemberNickname } from "../bot.js";
import db from "../db.js";

const SCOREBOARD_LENGTH = 5;

const command = new SlashCommandBuilder()
  .setName("scoreboard")
  .setDescription("View the scoreboard")
  .addNumberOption((option) =>
    option
      .setName("entries")
      .setDescription("How many people to put on the scoreboard")
      .setRequired(false)
      .setMaxValue(10)
      .setMinValue(3)
  ) as SlashCommandBuilder;

const handler = async (interaction: CommandInteraction) => {
  if (!interaction.channel) return;
  if (!db.data) {
    await interaction.reply({ content: "The database failed to load", ephemeral: true });
    return;
  }

  const data = Object.keys(db.data.users)
    .map((discordId) => ({
      id: discordId,
      score: db.data?.users[discordId] ?? 0
    }))
    .sort((a, b) => b.score - a.score);

  const entryCount = interaction.options.get("entries")?.value;

  data.length = Math.min((entryCount ? Number(entryCount) : null) ?? SCOREBOARD_LENGTH, data.length);

  const places = data.map((_, index) => index + 1);
  const userNames = await Promise.all(data.map(async (user) => (await getMemberNickname(user.id)) ?? user.id));
  const scores = data.map((user) => user.score);

  const embed = new EmbedBuilder()
    .setColor(0x6a4307)
    .setTitle("Scoreboard")
    .addFields(
      { name: "`#`", value: places.join("\n"), inline: true },
      { name: "`Name`", value: userNames.join("\n"), inline: true },
      { name: "`Score`", value: scores.join("\n"), inline: true }
    );

  await interaction.reply({ embeds: [embed] });
};

export { command, handler };
