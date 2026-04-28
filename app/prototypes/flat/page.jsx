import { getLatestDigest, getAllDates } from "@/lib/storage";
import ProtoView from "@/components/ProtoView";

export const revalidate = 60;

export default async function ProtoFlat() {
  const [digest, allDates] = await Promise.all([getLatestDigest(), getAllDates()]);
  return (
    <ProtoView
      digest={digest}
      allDates={allDates}
      cardLayout="flat"
      protoName="Flat Boxy"
      protoDesc="Clean flat cards — 1px border, minimal radius, no shadow. Editorial and direct."
      protoHref="/prototypes/flat"
      altHref="/prototypes/glass"
      altLabel="Try Glass →"
    />
  );
}
