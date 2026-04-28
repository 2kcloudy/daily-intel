import { getLatestDigest, getAllDates } from "@/lib/storage";
import DigestView from "@/components/DigestView";

export const revalidate = 60; // re-fetch every 5 minutes

export default async function Home() {
  const [digest, allDates] = await Promise.all([getLatestDigest(), getAllDates()]);
  return <DigestView digest={digest} allDates={allDates} />;
}
