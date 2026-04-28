import { getLatestDigest, getAllDates } from "@/lib/storage";
import DigestViewImageTopShort from "@/components/DigestViewImageTopShort";

export const revalidate = 60;

export const metadata = {
  title: "Daily Intel — Finance (Layout 3)",
  description: "Experimental Finance layout — image-top story cards with a half-height image strip.",
};

export default async function Finance3Page() {
  const [digest, allDates] = await Promise.all([getLatestDigest(), getAllDates()]);
  return <DigestViewImageTopShort digest={digest} allDates={allDates} />;
}
