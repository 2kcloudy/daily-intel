import { kv } from "@vercel/kv";

/**
 * Save a daily digest to KV storage.
 * @param {string} date - ISO date string "YYYY-MM-DD"
 * @param {object} digest - { date, marketPulse, stories, watchList }
 */
export async function saveDigest(date, digest) {
  // Save the digest itself
  await kv.set(`digest:${date}`, JSON.stringify(digest));

  // Add to the sorted date index (score = timestamp for sorting)
  const ts = new Date(date).getTime();
  await kv.zadd("digest:dates", { score: ts, member: date });
}

/**
 * Get a digest for a specific date.
 * @param {string} date - "YYYY-MM-DD"
 * @returns {object|null}
 */
export async function getDigest(date) {
  const raw = await kv.get(`digest:${date}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

/**
 * Get the most recent digest.
 * @returns {object|null}
 */
export async function getLatestDigest() {
  // Get the most recently scored date
  const dates = await kv.zrange("digest:dates", -1, -1);
  if (!dates || dates.length === 0) return null;
  return getDigest(dates[0]);
}

/**
 * Get all available dates, newest first.
 * @returns {string[]}
 */
export async function getAllDates() {
  const dates = await kv.zrange("digest:dates", 0, -1, { rev: true });
  return dates || [];
}
