import "dotenv/config";
import client from "./bot.js";
import db, { initDatabase } from "./db.js";

const { BOT_TOKEN } = process.env;

const main = async () => {
  await initDatabase();
  await db.write();
  await client.login(BOT_TOKEN);
};

main();
