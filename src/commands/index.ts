import * as PlayCommand from "./play.js";
import * as SimilarityCommand from "./similarity.js";
import * as SkipCommand from "./skip.js";
import * as TestCommand from "./test.js";
import * as ScoreboardCommand from "./scoreboard.js";
import * as FlagCommand from "./flag.js";
import { Collection } from "discord.js";
import type { Command } from "../types.js";

const commands = [PlayCommand, SimilarityCommand, SkipCommand, TestCommand, ScoreboardCommand, FlagCommand];

const commandCollection = new Collection<string, Command>();
commands.forEach((cmd) => commandCollection.set(cmd.command.name, cmd));

export { commands, commandCollection };
