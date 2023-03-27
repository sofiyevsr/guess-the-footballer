import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import TodaysChallenge from "@cmpt/pages/todaysChallenge";
import { NextSeo } from "next-seo";

function Challenge() {
  return (
    <>
      <NextSeo title="Today's Challenge" noindex />
      <TodaysChallenge />
    </>
  );
}

Challenge.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default Challenge;
