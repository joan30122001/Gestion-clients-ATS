import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const queues = new Map<string, Promise<unknown>>();

export async function readLocalJson<T>(fileName: string, fallback: T): Promise<T> {
  const { data, error } = await createAdminClient().from("app_store").select("data").eq("file_name", fileName).maybeSingle();
  if (error) throw error;
  return data ? data.data as T : fallback;
}

export function updateLocalJson<T>(fileName: string, fallback: T, update: (current: T) => T | Promise<T>): Promise<T> {
  const previous = queues.get(fileName) ?? Promise.resolve();
  const operation = previous.then(async () => {
    const current = await readLocalJson(fileName, fallback);
    const next = await update(current);
    const { error } = await createAdminClient().from("app_store").upsert({ file_name: fileName, data: next }, { onConflict: "file_name" });
    if (error) throw error;
    return next;
  });
  const tracked = operation.finally(() => {
    if (queues.get(fileName) === tracked) queues.delete(fileName);
  });
  queues.set(fileName, tracked);
  return operation;
}
