import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import type { User } from "discord.js";

interface DBSchema {
  users: {
    [key: string]: number;
  };
}

// Configure lowdb to write to JSONFile
const adapter = new JSONFile<DBSchema>("db.json");
const db = new Low(adapter);

const initDatabase = async () => {
  await db.read();
  db.data ||= { users: {} };
};

const incrementScore = async (member: User) => {
  if (!db.data) return;

  db.data.users[member.id] = db.data.users[member.id] ?? 0;
  db.data.users[member.id] += 1;

  await db.write();
};

const getScore = (member: User) => {
  if (!db.data) return null;

  return db.data.users[member.id] ?? 0;
};

export default db;
export { initDatabase, incrementScore, getScore };
