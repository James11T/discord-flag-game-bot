import { Client, GatewayIntentBits, Interaction } from "discord.js";
import { commandCollection } from "./commands";
import { processMessage } from "./game";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on("ready", async (client: Client<true>) => {
  console.log(`Ready as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;

  const command = commandCollection.get(commandName);

  if (!command) return;

  try {
    await command.handler(interaction);
  } catch (error) {
    await interaction.reply({
      content: "An error occurred and your request could not be processed.",
      ephemeral: true
    });
  }
});

client.on("messageCreate", processMessage);

export default client;
