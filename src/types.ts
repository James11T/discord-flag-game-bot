import { SlashCommandBuilder } from "discord.js";
import type { CommandInteraction } from "discord.js";

interface Command {
  handler: (interaction: CommandInteraction) => Promise<void>;
  command: SlashCommandBuilder;
}

export { Command };
