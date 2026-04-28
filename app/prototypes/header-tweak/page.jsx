import { getLatestDigest, getAllDates } from "@/lib/storage";
import HeaderTweakView from "@/components/HeaderTweakView";

export const revalidate = 60;

export default async function ProtoHeaderTweak() {
  const [digest, allDates] = await Promise.all([getLatestDigest(), getAllDates()]);
  return <HeaderTweakView digest={digest} allDates={allDates} />;
}
