import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import { NextSeo } from "next-seo";
import Challenge from "@modules/challenge";

function ChallengePage() {
  return (
    <>
      <NextSeo title="Daily challenge" />
      <Challenge />
    </>
  );
}

ChallengePage.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default ChallengePage;