import * as FlagCommand from "./flag";
import * as SimilarityCommand from "./similarity";
import * as SkipCommand from "./skip";
import { Collection } from "discord.js";

import type { Command } from "../types";

const commands = [FlagCommand, SimilarityCommand, SkipCommand];
const commandCollection = new Collection<string, Command>();
commands.forEach((cmd) => commandCollection.set(cmd.command.name, cmd));

export { commands, commandCollection };
