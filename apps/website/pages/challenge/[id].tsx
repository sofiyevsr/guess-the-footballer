import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import { NextSeo } from "next-seo";
import Challenge from "@cmpt/pages/challenge";

function ChallengePage() {
  return (
    <>
      <NextSeo title="Challenge" />
      <Challenge />
    </>
  );
}

ChallengePage.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default ChallengePage;
