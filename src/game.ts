import config from "./config";
import countries, { codeToImage, countryCodes, randomCountryCode } from "./countries";
import { compareTwoStrings } from "string-similarity";
import type { CountryCode } from "./types";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  Message,
  MessageActionRowComponentBuilder,
  TextBasedChannel
} from "discord.js";

interface ActiveGame {
  channel: TextBasedChannel;
  active: true;
  country: CountryCode;
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
const pastEntries: CountryCode[] = [];

const playAgainRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
  new ButtonBuilder().setCustomId("playagain").setLabel("Play Again").setStyle(ButtonStyle.Primary)
);

const skipRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
  new ButtonBuilder().setCustomId("skip").setLabel("Skip").setStyle(ButtonStyle.Danger)
);

const setFlag = (channel: TextBasedChannel, country: CountryCode) => {
  game = {
    channel: channel,
    active: true,
    country: country
  };

  pastEntries.unshift(country);

  if (pastEntries.length > config.NO_REPEAT_INTERVAL) {
    pastEntries.pop();
  }

  failTimeout = setTimeout(() => {
    clearFlag(true);
  }, 30 * 1000);
};

const clearFlag = async (timeout = true) => {
  if (!game.active) return;
  const countryNames = countries[game.country];

  if (timeout && game.channel && game.country) {
    await game.channel.send(`Nobody managed to guess the flag in time, it was \`${countryNames[0]}\``);
  } else {
    clearTimeout(failTimeout);
  }

  game = {
    active: false,
    country: null,
    channel: null
  };
};

const getClosestCountry = (query: string): [CountryCode, number] => {
  let closestCountry: CountryCode = countryCodes[0];
  let closestSimilarity = 0;
  const lowerCaseQuery = query.toLowerCase();

  countryCodes.forEach((countryCode) => {
    if (closestSimilarity === 1) return;

    const countryNames = countries[countryCode];
    const similarity = Math.max(...countryNames.map((alias) => compareTwoStrings(lowerCaseQuery, alias.toLowerCase())));

    if (similarity > closestSimilarity) {
      closestSimilarity = similarity;
      closestCountry = countryCode;
    }
  });

  return [closestCountry, closestSimilarity];
};

const processMessage = async (message: Message) => {
  if (message.author.bot) return;
  if (!game.active) return console.log("No active game");
  if (message.channel.id !== game.channel.id) return console.log("Wrong channel");

  const content = message.content.toLowerCase();
  const countryNames = countries[game.country];
  const [closestCountry, closestSimilarity] = getClosestCountry(content);

  if (closestCountry !== game.country || closestSimilarity < config.SIMILARITY_THRESHOLD)
    return console.log("Wrong country");

  clearFlag(false);

  await message.reply({ content: `Correct! It was \`${countryNames[0]}\``, components: [playAgainRow] });
};

const newGame = async (interaction: ButtonInteraction | CommandInteraction) => {
  if (!interaction.channel) return;

  if (game.active) {
    await interaction.reply({
      content: `Sorry, there is already an active game.`,
      ephemeral: true
    });
    return;
  }

  const countryCode = randomCountryCode();
  const flag = codeToImage(countryCode);

  setFlag(interaction.channel, countryCode);

  await interaction.reply({
    content: `What country / territory does this flag belong to? Country Code: || ${countryCode} ||`,
    files: [flag],
    components: [skipRow],
    ephemeral: false
  });
};

const skipFlag = async (interaction: ButtonInteraction | CommandInteraction) => {
  if (!interaction.channel) return;

  if (!game.active) {
    await interaction.reply({
      content: `There currently not an active game.`,
      ephemeral: true
    });
    return;
  }

  await interaction.reply({
    content: `Skipped flag, it was \`${countries[game.country][0]}\``,
    ephemeral: false,
    components: [playAgainRow]
  });

  clearFlag(false);
};

export { game, pastEntries, playAgainRow, setFlag, clearFlag, processMessage, getClosestCountry, newGame, skipFlag };
