import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "messages.json");

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export async function saveMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactMessage> {
  let messages: ContactMessage[] = [];
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    messages = JSON.parse(raw) as ContactMessage[];
  } catch {
    messages = [];
  }

  const entry: ContactMessage = {
    id: `MSG-${Date.now().toString(36).toUpperCase()}`,
    ...input,
    createdAt: new Date().toISOString(),
  };

  messages.push(entry);
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), "utf-8");
  return entry;
}
