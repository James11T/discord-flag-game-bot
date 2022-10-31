import { compareTwoStrings } from "string-similarity";
import type { Message, TextBasedChannel } from "discord.js";

const SIMILARITY_THRESHOLD = 0.5;

interface Game {
  channel: TextBasedChannel | null;
  channelName: string;
  invokedAt: number;
  active: boolean;
  country: string | null;
}

const game: Game = {
  channel: null,
  channelName: "",
  invokedAt: 0,
  active: false,
  country: ""
};

let failTimeout: NodeJS.Timeout;

const setFlag = (channel: TextBasedChannel, country: string) => {
  game.channel = channel;
  game.country = country.toLowerCase();
  game.active = true;

  failTimeout = setTimeout(() => {
    clearFlag(true);
  }, 30 * 1000);
};

const clearFlag = async (timeout = true) => {
  if (timeout && game.channel) {
    await game.channel.send(`Nobody managed to guess the flag in time, it was **${game.country}**`);
  } else {
    clearTimeout(failTimeout);
  }

  game.channel = null;
  game.country = null;
  game.active = false;
};

const processMessage = async (message: Message) => {
  if (message.author.bot) return;
  if (!game.active || !game.channel || !game.country) return;
  if (message.channel.id !== game.channel.id) return;

  const similarity = compareTwoStrings(message.content.toLowerCase(), game.country);

  if (similarity < SIMILARITY_THRESHOLD) return;

  clearFlag(false);
  await message.reply("Correct!");
};

export { game, setFlag, clearFlag, processMessage, SIMILARITY_THRESHOLD };
