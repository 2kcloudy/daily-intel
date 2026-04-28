import { getLatestDigest, getAllDates } from "@/lib/storage";
import ProtoView from "@/components/ProtoView";

export const revalidate = 60;

export default async function ProtoGlass() {
  const [digest, allDates] = await Promise.all([getLatestDigest(), getAllDates()]);
  return (
    <ProtoView
      digest={digest}
      allDates={allDates}
      cardLayout="image-top"
      protoName="Glass Cards"
      protoDesc="Lifted glass cards — layered depth shadows, 22px radius, image on top."
      protoHref="/prototypes/glass"
      altHref="/prototypes/flat"
      altLabel="Try Flat →"
    />
  );
}
