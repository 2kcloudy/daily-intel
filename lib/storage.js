import { kv } from "@vercel/kv";

// ─── Finance Digest ─────────────────────────────────────────────────────────

/**
 * Save a daily finance digest to KV storage.
 * @param {string} date - ISO date string "YYYY-MM-DD"
 * @param {object} digest - { date, marketPulse, stories, watchList }
 */
export async function saveDigest(date, digest) {
  await kv.set(`digest:${date}`, JSON.stringify(digest));
  const ts = new Date(date).getTime();
  await kv.zadd("digest:dates", { score: ts, member: date });
}

/**
 * Get a finance digest for a specific date.
 * @param {string} date - "YYYY-MM-DD"
 * @returns {object|null}
 */
export async function getDigest(date) {
  const raw = await kv.get(`digest:${date}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

/**
 * Get the most recent finance digest.
 * @returns {object|null}
 */
export async function getLatestDigest() {
  const dates = await kv.zrange("digest:dates", -1, -1);
  if (!dates || dates.length === 0) return null;
  return getDigest(dates[0]);
}

/**
 * Get all available finance dates, newest first.
 * @returns {string[]}
 */
export async function getAllDates() {
  const dates = await kv.zrange("digest:dates", 0, -1, { rev: true });
  return dates || [];
}

// ─── Health Digest ───────────────────────────────────────────────────────────

/**
 * Save a daily health digest to KV storage.
 * @param {string} date - ISO date string "YYYY-MM-DD"
 * @param {object} digest - { date, healthPulse, stories, spotlights }
 */
export async function saveHealthDigest(date, digest) {
  await kv.set(`health-digest:${date}`, JSON.stringify(digest));
  const ts = new Date(date).getTime();
  await kv.zadd("health-digest:dates", { score: ts, member: date });
}

/**
 * Get a health digest for a specific date.
 * @param {string} date - "YYYY-MM-DD"
 * @returns {object|null}
 */
export async function getHealthDigest(date) {
  const raw = await kv.get(`health-digest:${date}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

/**
 * Get the most recent health digest.
 * @returns {object|null}
 */
export async function getLatestHealthDigest() {
  const dates = await kv.zrange("health-digest:dates", -1, -1);
  if (!dates || dates.length === 0) return null;
  return getHealthDigest(dates[0]);
}

/**
 * Get all available health dates, newest first.
 * @returns {string[]}
 */
export async function getAllHealthDates() {
  const dates = await kv.zrange("health-digest:dates", 0, -1, { rev: true });
  return dates || [];
}
