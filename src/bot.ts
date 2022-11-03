import {
  ActivityType,
  ButtonInteraction,
  Client,
  CommandInteraction,
  GatewayIntentBits,
  Interaction,
  ReactionUserManager
} from "discord.js";
import { commandCollection } from "./commands/index.js";
import { newGame, processMessage, revealCode, skipFlag } from "./game.js";

const { GUILD_ID } = process.env;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
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

const interactions = {
  playagain: newGame,
  skip: skipFlag,
  code: revealCode
} as const;

const isInteraction = (key: string): key is keyof typeof interactions => key in interactions;

const handleButtonInteraction = async (interaction: ButtonInteraction) => {
  if (!isInteraction(interaction.customId)) return;

  interactions[interaction.customId](interaction);
};

const getMember = async (id: string) => {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return null;

  const cachedUser = guild.members.cache.get(id);
  if (cachedUser) return cachedUser;

  const member = await guild.members.fetch({ user: id });
  return member ?? null;
};

const getMemberNickname = async (id: string) => {
  const member = await getMember(id);
  if (!member) return id;
  return member.nickname ?? member.user.username;
};

client.on("ready", async (client: Client<true>) => {
  console.log(`Ready as ${client.user.tag}`);
  client.user.setActivity("/flag", {
    type: ActivityType.Watching
  });
});

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
export { getMember, getMemberNickname };
