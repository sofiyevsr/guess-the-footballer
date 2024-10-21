import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import { NextSeo } from "next-seo";
import Challenges from "@modules/challenges";

function ChallengesPage() {
  return (
    <>
      <NextSeo title="Daily challenges" />
      <Challenges />
    </>
  );
}

ChallengesPage.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default ChallengesPage;
