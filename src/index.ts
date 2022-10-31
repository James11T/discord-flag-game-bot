import "dotenv/config";
import client from "./bot";

const { BOT_TOKEN } = process.env;

client.login(BOT_TOKEN);
