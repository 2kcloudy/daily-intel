import { getDigest, getAllDates } from "@/lib/storage";
import { notFound } from "next/navigation";
import DigestView from "@/components/DigestView";

export const revalidate = 120;

export default async function DatePage({ params }) {
  const { date } = params;
  const [digest, allDates] = await Promise.all([getDigest(date), getAllDates()]);
  if (!digest) notFound();
  return <DigestView digest={digest} allDates={allDates} />;
}

export async function generateStaticParams() {
  try {
    const dates = await getAllDates();
    return dates.map((date) => ({ date }));
  } catch {
    return [];
  }
}
