import { SlashCommandBuilder } from "@discordjs/builders";
import { skipFlag } from "../game.js";
import type { CommandInteraction } from "discord.js";

const command = new SlashCommandBuilder().setName("skip").setDescription("Skip the current flag");

const handler = async (interaction: CommandInteraction) => {
  skipFlag(interaction);
};

export { command, handler };
