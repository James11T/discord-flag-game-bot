import { ButtonInteraction, Client, CommandInteraction, GatewayIntentBits, Interaction } from "discord.js";
import { commandCollection } from "./commands";
import { newGame, processMessage, skipFlag } from "./game";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on("ready", async (client: Client<true>) => {
  console.log(`Ready as ${client.user.tag}`);
});

const handleCommandInteraction = async (interaction: CommandInteraction) => {
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
};

const handleButtonInteraction = async (interaction: ButtonInteraction) => {
  if (interaction.customId === "playagain") {
    newGame(interaction);
  } else if (interaction.customId === "skip") {
    skipFlag(interaction);
  }
};

client.on("interactionCreate", async (interaction: Interaction) => {
  if (interaction.isCommand()) return handleCommandInteraction(interaction);
  if (interaction.isButton()) return handleButtonInteraction(interaction);
});

client.on("messageCreate", processMessage);
client.on("messageUpdate", (_, newMessage) => {
  if (newMessage.partial) return;
  processMessage(newMessage);
});

export default client;
