import { compareTwoStrings } from "string-similarity";
import type { Message, TextBasedChannel } from "discord.js";
import countries from "./countries";

const SIMILARITY_THRESHOLD = 0.5;

interface ActiveGame {
  channel: TextBasedChannel;
  active: true;
  country: keyof typeof countries;
}

interface InactiveGame {
  channel: null;
  active: false;
  country: null;
}

type Game = ActiveGame | InactiveGame;

let game: Game = {
  channel: null,
  active: false,
  country: null
};

let failTimeout: NodeJS.Timeout;

const setFlag = (channel: TextBasedChannel, country: keyof typeof countries) => {
  game = {
    channel: channel,
    active: true,
    country: country
  };

  failTimeout = setTimeout(() => {
    clearFlag(true);
  }, 30 * 1000);
};

const clearFlag = async (timeout = true) => {
  if (timeout && game.channel && game.country) {
    await game.channel.send(`Nobody managed to guess the flag in time, it was **${game.country[0]}**`);
  } else {
    clearTimeout(failTimeout);
  }

  game.channel = null;
  game.country = null;
  game.active = false;
};

const processMessage = async (message: Message) => {
  if (message.author.bot) return;
  if (!game.active) return;
  if (message.channel.id !== game.channel.id) return;

  const content = message.content.toLowerCase();

  const countryNames = countries[game.country];

  const similarity = Math.max(...countryNames.map((alias) => compareTwoStrings(content, alias)));

  if (similarity < SIMILARITY_THRESHOLD) return;

  clearFlag(false);
  await message.reply(`Correct! It was \`${countryNames[0]}\``);
};

export { game, setFlag, clearFlag, processMessage, SIMILARITY_THRESHOLD };
