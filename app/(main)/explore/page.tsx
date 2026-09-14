import type { Metadata } from "next";
import { ExploreView } from "@/components/explore/explore-view";
import { Page, PageHeader } from "@/components/ui/page";

export const metadata: Metadata = {
  title: "Explore the 99 Names",
  description:
    "All 99 Names of Allah in Arabic, with transliteration and meaning. Search by name, meaning, or number.",
};

export default function ExplorePage() {
  return (
    <Page width="wide">
      <PageHeader
        title="Explore"
        description="All 99 Names, in the order of the list this app follows."
      />
      <ExploreView />
    </Page>
  );
}
