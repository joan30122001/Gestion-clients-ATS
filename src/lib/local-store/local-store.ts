import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const dataDirectory = process.env.LOCAL_DATA_DIR || (process.env.VERCEL ? "/tmp/ats-data" : join(process.cwd(), ".data"));
const queues = new Map<string, Promise<unknown>>();

export async function readLocalJson<T>(fileName: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(join(dataDirectory, fileName), "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

export function updateLocalJson<T>(fileName: string, fallback: T, update: (current: T) => T | Promise<T>): Promise<T> {
  const path = join(dataDirectory, fileName);
  const previous = queues.get(path) ?? Promise.resolve();
  const operation = previous.then(async () => {
    const current = await readLocalJson(fileName, fallback);
    const next = await update(current);
    await mkdir(dirname(path), { recursive: true });
    const temporary = `${path}.${process.pid}.${crypto.randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    await rename(temporary, path);
    return next;
  });
  const tracked = operation.finally(() => {
    if (queues.get(path) === tracked) queues.delete(path);
  });
  queues.set(path, tracked);
  return operation;
}
