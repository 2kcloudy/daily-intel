import { getLatestHealthDigest, getAllHealthDates } from "@/lib/storage";
import GenericDigestView from "@/components/GenericDigestView";

export const revalidate = 300;

export const metadata = {
  title: "Health Intel — Daily Intel",
  description: "Daily health & wellness intelligence curated by AI.",
};

export default async function HealthPage() {
  const [digest, allDates] = await Promise.all([
    getLatestHealthDigest(),
    getAllHealthDates(),
  ]);
  return (
    <GenericDigestView
      digest={digest}
      allDates={allDates}
      tabKey="health"
    />
  );
}
