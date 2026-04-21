import { getHealthDigest, getAllHealthDates } from "@/lib/storage";
import { notFound } from "next/navigation";
import HealthDigestView from "@/components/HealthDigestView";

export const revalidate = 3600;

export default async function HealthDatePage({ params }) {
  const { date } = params;
  const [digest, allDates] = await Promise.all([
    getHealthDigest(date),
    getAllHealthDates(),
  ]);
  if (!digest) notFound();
  return <HealthDigestView digest={digest} allDates={allDates} />;
}

export async function generateStaticParams() {
  try {
    const dates = await getAllHealthDates();
    return dates.map((date) => ({ date }));
  } catch {
    return [];
  }
}
