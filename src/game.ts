import config from "./config.js";
import countries, { codeToImage, countryCodes, randomCountryCode } from "./countries.js";
import { compareTwoStrings } from "string-similarity";
import type { CountryCode } from "./types.js";
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
import { getScore, incrementScore } from "./db.js";

interface BaseGame {
  codeRevealed: boolean;
}

interface ActiveGame extends BaseGame {
  channel: TextBasedChannel;
  active: true;
  country: CountryCode;
}

interface InactiveGame extends BaseGame {
  channel: null;
  active: false;
  country: null;
}

type Game = ActiveGame | InactiveGame;

let game: Game = {
  channel: null,
  active: false,
  country: null,
  codeRevealed: false
};

let failTimeout: NodeJS.Timeout;
const pastEntries: CountryCode[] = [];

const skipButton = new ButtonBuilder().setCustomId("skip").setLabel("Skip").setStyle(ButtonStyle.Danger);
const skipUsedButton = new ButtonBuilder()
  .setCustomId("skip")
  .setLabel("Skip")
  .setStyle(ButtonStyle.Danger)
  .setDisabled(true);
const revealCodeButton = new ButtonBuilder().setCustomId("code").setLabel("Reveal Code").setStyle(ButtonStyle.Primary);
const revealCodeUsedButton = new ButtonBuilder()
  .setCustomId("code")
  .setLabel("Reveal Code")
  .setStyle(ButtonStyle.Primary)
  .setDisabled(true);
const playAgainButton = new ButtonBuilder()
  .setCustomId("playagain")
  .setLabel("Play Again")
  .setStyle(ButtonStyle.Primary);

const playAgainRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(playAgainButton);

const flagControls = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
  skipButton,
  revealCodeButton
);

const flagRevealUsedControls = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
  skipButton,
  revealCodeUsedButton
);

const flagDisabledControls = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
  skipUsedButton,
  revealCodeUsedButton
);

const setFlag = (channel: TextBasedChannel, country: CountryCode) => {
  game = {
    channel: channel,
    active: true,
    country: country,
    codeRevealed: false
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
    await game.channel.send({
      content: `Nobody managed to guess the flag in time, it was \`${countryNames[0]}\``,
      components: [playAgainRow]
    });
  } else {
    clearTimeout(failTimeout);
  }

  game = {
    active: false,
    country: null,
    channel: null,
    codeRevealed: false
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
  if (!game.active) return;
  if (message.channel.id !== game.channel.id) return;

  const content = message.content.toLowerCase();
  const countryNames = countries[game.country];
  const [closestCountry, closestSimilarity] = getClosestCountry(content);

  if (closestCountry !== game.country || closestSimilarity < config.SIMILARITY_THRESHOLD) return;

  clearFlag(false);
  await incrementScore(message.author);
  await message.reply({
    content: `Correct! It was \`${countryNames[0]}\`. Your score is now \` ${getScore(message.author) ?? "Unknown"} \``,
    components: [playAgainRow]
  });
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
    content: "What country / territory does this flag belong to?",
    files: [flag],
    components: [flagControls],
    ephemeral: false
  });
};

const skipFlag = async (interaction: ButtonInteraction | CommandInteraction) => {
  if (!interaction.channel) return;

  if (!game.active) {
    await interaction.reply({
      content: "There currently not an active game.",
      ephemeral: true
    });
    return;
  }

  const skipMessage = `Skipped flag, it was \`${countries[game.country][0]}\``;

  clearFlag(false);

  if (interaction.isMessageComponent()) {
    await interaction.message.edit({ components: [flagDisabledControls] });
  }

  await interaction.reply({
    content: skipMessage,
    ephemeral: false,
    components: [playAgainRow]
  });
};

const revealCode = async (interaction: ButtonInteraction | CommandInteraction) => {
  if (!interaction.channel) return;

  if (!game.active) {
    await interaction.reply({
      content: "There currently not an active game.",
      ephemeral: true
    });
    return;
  }

  if (game.codeRevealed) {
    await interaction.reply({
      content: `Code already revealed`,
      ephemeral: true
    });
    return;
  }

  game.codeRevealed = true;
  if (interaction.isMessageComponent()) {
    interaction.message.edit({ components: [flagRevealUsedControls] });
  }

  await interaction.reply({
    content: `The country code of the current flag is  \` ${game.country} \``,
    ephemeral: false
  });
};

export {
  game,
  pastEntries,
  playAgainRow,
  setFlag,
  clearFlag,
  processMessage,
  getClosestCountry,
  newGame,
  skipFlag,
  revealCode
};
