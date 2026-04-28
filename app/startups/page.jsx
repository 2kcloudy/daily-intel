import { getLatestTabDigest, getAllTabDates, getTabDigest } from "@/lib/storage";
import GenericDigestView from "@/components/GenericDigestView";
import { TAB_CONFIGS } from "@/components/TabConfig";

export const revalidate = 300;

export const metadata = {
  title: TAB_CONFIGS["startups"].metaTitle,
  description: TAB_CONFIGS["startups"].metaDescription,
};

export default async function StartupsPage() {
  const [digest, allDates] = await Promise.all([
    getLatestTabDigest("startups"),
    getAllTabDates("startups"),
  ]);

  // Get previous digest topics for trending indicator
  let prevTopics = [];
  if (allDates.length > 1) {
    const prev = await getTabDigest("startups", allDates[1]);
    if (prev?.stories) prevTopics = [...new Set(prev.stories.map(s => s.topic).filter(Boolean))];
  }

  return <GenericDigestView digest={digest} allDates={allDates} prevTopics={prevTopics} config={TAB_CONFIGS["startups"]} />;
}
