import { getLatestDigest, getAllDates } from "@/lib/storage";
import DigestViewImageTop from "@/components/DigestViewImageTop";

export const revalidate = 60;

export const metadata = {
  title: "Daily Intel — Finance (Layout 2)",
  description: "Experimental Finance layout — image-top story cards.",
};

export default async function Finance2Page() {
  const [digest, allDates] = await Promise.all([getLatestDigest(), getAllDates()]);
  return <DigestViewImageTop digest={digest} allDates={allDates} />;
}
