import { getLatestTabDigest, getAllTabDates, getTabDigest } from "@/lib/storage";
import GenericDigestView from "@/components/GenericDigestView";
import { TAB_CONFIGS } from "@/components/TabConfig";

export const revalidate = 60;

export const metadata = {
  title: TAB_CONFIGS["policy"].metaTitle,
  description: TAB_CONFIGS["policy"].metaDescription,
};

export default async function PolicyPage() {
  const [digest, allDates] = await Promise.all([
    getLatestTabDigest("policy"),
    getAllTabDates("policy"),
  ]);

  // Get previous digest topics for trending indicator
  let prevTopics = [];
  if (allDates.length > 1) {
    const prev = await getTabDigest("policy", allDates[1]);
    if (prev?.stories) prevTopics = [...new Set(prev.stories.map(s => s.topic).filter(Boolean))];
  }

  return <GenericDigestView digest={digest} allDates={allDates} prevTopics={prevTopics} config={TAB_CONFIGS["policy"]} />;
}
