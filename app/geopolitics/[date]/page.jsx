import { getTabDigest, getAllTabDates } from "@/lib/storage";
import GenericDigestView from "@/components/GenericDigestView";
import { TAB_CONFIGS } from "@/components/TabConfig";
import { notFound } from "next/navigation";

export const revalidate = 120;

export async function generateStaticParams() {
  const dates = await getAllTabDates("geopolitics");
  return dates.map(date => ({ date }));
}

export default async function GeopoliticsDatePage({ params }) {
  const { date } = params;
  const [digest, allDates] = await Promise.all([
    getTabDigest("geopolitics", date),
    getAllTabDates("geopolitics"),
  ]);

  if (!digest) notFound();

  // Get previous digest topics
  let prevTopics = [];
  const idx = allDates.indexOf(date);
  if (idx < allDates.length - 1) {
    const prev = await getTabDigest("geopolitics", allDates[idx + 1]);
    if (prev?.stories) prevTopics = [...new Set(prev.stories.map(s => s.topic).filter(Boolean))];
  }

  return <GenericDigestView digest={digest} allDates={allDates} prevTopics={prevTopics} config={TAB_CONFIGS["geopolitics"]} />;
}
