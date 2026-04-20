import { kv } from "@vercel/kv";

const isKVAvailable = () =>
  !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

export async function saveDigest(date, digest) {
  if (!isKVAvailable()) throw new Error("KV not configured — add KV_REST_API_URL and KV_REST_API_TOKEN");
  const data = { ...digest, date, postedAt: new Date().toISOString() };
  await kv.set(`digest:${date}`, JSON.stringify(data));
  const ts = new Date(date).getTime();
  await kv.zadd("digest:dates", { score: ts, member: date });
  return data;
}

export async function getDigest(date) {
  if (!isKVAvailable()) return null;
  try {
    const raw = await kv.get(`digest:${date}`);
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function getLatestDigest() {
  if (!isKVAvailable()) return null;
  try {
    const dates = await kv.zrange("digest:dates", -1, -1);
    if (!dates || dates.length === 0) return null;
    return getDigest(dates[0]);
  } catch {
    return null;
  }
}

export async function getAllDates() {
  if (!isKVAvailable()) return [];
  try {
    const dates = await kv.zrange("digest:dates", 0, -1, { rev: true });
    return dates || [];
  } catch {
    return [];
  }
}
