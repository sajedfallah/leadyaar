type UpstashResponse<T> = { result?: T; error?: string };

export function hasPersistentStore() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function command<T>(parts: Array<string | number>): Promise<T | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parts),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Storage HTTP ${response.status}`);
  const data = (await response.json()) as UpstashResponse<T>;
  if (data.error) throw new Error(data.error);
  return data.result ?? null;
}

export async function getJson<T>(key: string): Promise<T | null> {
  const raw = await command<string>(["GET", key]);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function setJson(key: string, value: unknown) {
  if (!hasPersistentStore()) return false;
  await command<string>(["SET", key, JSON.stringify(value)]);
  return true;
}
