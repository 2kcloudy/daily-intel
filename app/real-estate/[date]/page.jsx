import { getTabDigest, getAllTabDates } from "@/lib/storage";
import GenericDigestView from "@/components/GenericDigestView";
import { TAB_CONFIGS } from "@/components/TabConfig";
import { notFound } from "next/navigation";

export const revalidate = 120;

export async function generateStaticParams() {
  const dates = await getAllTabDates("real-estate");
  return dates.map(date => ({ date }));
}

export default async function RealEstateDatePage({ params }) {
  const { date } = params;
  const [digest, allDates] = await Promise.all([
    getTabDigest("real-estate", date),
    getAllTabDates("real-estate"),
  ]);

  if (!digest) notFound();

  // Get previous digest topics
  let prevTopics = [];
  const idx = allDates.indexOf(date);
  if (idx < allDates.length - 1) {
    const prev = await getTabDigest("real-estate", allDates[idx + 1]);
    if (prev?.stories) prevTopics = [...new Set(prev.stories.map(s => s.topic).filter(Boolean))];
  }

  return <GenericDigestView digest={digest} allDates={allDates} prevTopics={prevTopics} config={TAB_CONFIGS["real-estate"]} />;
}
