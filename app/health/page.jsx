import { getLatestHealthDigest, getAllHealthDates } from "@/lib/storage";
import HealthDigestView from "@/components/HealthDigestView";

export const revalidate = 300;

export const metadata = {
  title: "Health Intel — Daily Intel",
  description: "Daily health & wellness intelligence curated by AI — sleep, nutrition, longevity, exercise, and more.",
};

export default async function HealthPage() {
  const [digest, allDates] = await Promise.all([
    getLatestHealthDigest(),
    getAllHealthDates(),
  ]);
  return <HealthDigestView digest={digest} allDates={allDates} />;
}
