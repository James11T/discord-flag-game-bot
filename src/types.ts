import { SlashCommandBuilder } from "discord.js";
import countries from "./countries.js";
import type { CommandInteraction } from "discord.js";

interface Command {
  handler: (interaction: CommandInteraction) => Promise<void>;
  command: SlashCommandBuilder;
}

type CountryCode = keyof typeof countries;

export { Command, CountryCode };
