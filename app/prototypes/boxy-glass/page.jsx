import { getLatestDigest, getAllDates } from "@/lib/storage";
import ProtoView from "@/components/ProtoView";

export const revalidate = 60;

export default async function ProtoBoxyGlass() {
  const [digest, allDates] = await Promise.all([getLatestDigest(), getAllDates()]);
  return (
    <ProtoView
      digest={digest}
      allDates={allDates}
      cardLayout="image-top"
      protoName="Boxy Glass"
      protoDesc="Glass depth shadows with sharp 6px corners — structured and premium."
      protoHref="/prototypes/boxy-glass"
      altHref="/prototypes/glass"
      altLabel="Try Rounded →"
      initialGlassStyle="boxy"
    />
  );
}
