import { kv } from "@vercel/kv";
import { attachImagesToStories } from "./imageCache";

/**
 * Hydrate a digest's stories with images if they weren't attached at POST time.
 * Mutates only the in-memory object — no KV writes.
 * Safe for legacy digests created before inline images were added.
 */
function hydrateDigest(digest) {
  if (digest && Array.isArray(digest.stories)) {
    attachImagesToStories(digest.stories);
  }
  return digest;
}

// ─── Finance Digest ───────────────────────────────────────────────────────────

export async function saveDigest(date, digest) {
  await kv.set(`digest:${date}`, JSON.stringify(digest));
  const ts = new Date(date).getTime();
  await kv.zadd("digest:dates", { score: ts, member: date });
}

export async function getDigest(date) {
  const raw = await kv.get(`digest:${date}`);
  if (!raw) return null;
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  return hydrateDigest(parsed);
}

export async function getLatestDigest() {
  const dates = await kv.zrange("digest:dates", -1, -1);
  if (!dates || dates.length === 0) return null;
  return getDigest(dates[0]);
}

export async function getAllDates() {
  const dates = await kv.zrange("digest:dates", 0, -1, { rev: true });
  return dates || [];
}

// ─── Health Digest ───────────────────────────────────────────────────────────

export async function saveHealthDigest(date, digest) {
  await kv.set(`health-digest:${date}`, JSON.stringify(digest));
  const ts = new Date(date).getTime();
  await kv.zadd("health-digest:dates", { score: ts, member: date });
}

export async function getHealthDigest(date) {
  const raw = await kv.get(`health-digest:${date}`);
  if (!raw) return null;
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  return hydrateDigest(parsed);
}

export async function getLatestHealthDigest() {
  const dates = await kv.zrange("health-digest:dates", -1, -1);
  if (!dates || dates.length === 0) return null;
  return getHealthDigest(dates[0]);
}

export async function getAllHealthDates() {
  const dates = await kv.zrange("health-digest:dates", 0, -1, { rev: true });
  return dates || [];
}

// ─── Generic Tab Digest ───────────────────────────────────────────────────────
// Used for: tech, geopolitics, energy, real-estate, startups, crypto,
//            science, longevity, policy, performance

export async function saveTabDigest(tabKey, date, digest) {
  await kv.set(`${tabKey}-digest:${date}`, JSON.stringify(digest));
  const ts = new Date(date).getTime();
  await kv.zadd(`${tabKey}-digest:dates`, { score: ts, member: date });
}

export async function getTabDigest(tabKey, date) {
  const raw = await kv.get(`${tabKey}-digest:${date}`);
  if (!raw) return null;
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  return hydrateDigest(parsed);
}

export async function getLatestTabDigest(tabKey) {
  const dates = await kv.zrange(`${tabKey}-digest:dates`, -1, -1);
  if (!dates || dates.length === 0) return null;
  return getTabDigest(tabKey, dates[0]);
}

export async function getAllTabDates(tabKey) {
  const dates = await kv.zrange(`${tabKey}-digest:dates`, 0, -1, { rev: true });
  return dates || [];
}

// ─── Subscribers ──────────────────────────────────────────────────────────────

export async function addSubscriber(email, tab = "finance") {
  await kv.sadd(`subscribers:${tab}`, email);
  await kv.sadd("subscribers:all", email);
}

export async function getAllSubscribers(tab = "all") {
  return await kv.smembers(`subscribers:${tab}`) || [];
}
