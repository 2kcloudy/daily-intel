import { getLatestTabDigest, getAllTabDates, getTabDigest } from "@/lib/storage";
import GenericDigestView from "@/components/GenericDigestView";
import { TAB_CONFIGS } from "@/components/TabConfig";

export const revalidate = 60;

export const metadata = {
  title: TAB_CONFIGS["performance"].metaTitle,
  description: TAB_CONFIGS["performance"].metaDescription,
};

export default async function PerformancePage() {
  const [digest, allDates] = await Promise.all([
    getLatestTabDigest("performance"),
    getAllTabDates("performance"),
  ]);

  // Get previous digest topics for trending indicator
  let prevTopics = [];
  if (allDates.length > 1) {
    const prev = await getTabDigest("performance", allDates[1]);
    if (prev?.stories) prevTopics = [...new Set(prev.stories.map(s => s.topic).filter(Boolean))];
  }

  return <GenericDigestView digest={digest} allDates={allDates} prevTopics={prevTopics} config={TAB_CONFIGS["performance"]} />;
}
