import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction } from "discord.js";
import countries, { codeToImage } from "../countries.js";
import { getClosestCountry } from "../game.js";
import { CountryCode } from "../types.js";

const command = new SlashCommandBuilder()
  .setName("flag")
  .setDescription("Get the flag of a country by code or name")
  .addStringOption((option) =>
    option.setName("country").setDescription("Country ISO code or common name").setRequired(true)
  ) as SlashCommandBuilder;

const handler = async (interaction: CommandInteraction) => {
  if (!interaction.channel) return;

  const country = interaction.options.get("country")?.value;

  if (!country) {
    await interaction.reply({ content: "Bad parameter", ephemeral: true });
    return;
  }

  const stringCountry = String(country);

  let countryCode: CountryCode | null = null;

  if (stringCountry.toUpperCase() in countries) {
    countryCode = stringCountry as CountryCode;
  } else {
    const [closest] = getClosestCountry(String(country));
    countryCode = closest;
  }

  await interaction.reply({
    content: `The flag of \` ${countries[countryCode]} \``,
    files: [codeToImage(countryCode)],
    ephemeral: false
  });
};

export { command, handler };
