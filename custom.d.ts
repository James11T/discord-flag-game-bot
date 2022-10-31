import type { Command } from "./types";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      GUILD_ID: string;
      BOT_ID: string;
    }
  }
  namespace DiscordJS {
    interface Client {
      commands: Record<string, Command>;
    }
  }
}

export {};
