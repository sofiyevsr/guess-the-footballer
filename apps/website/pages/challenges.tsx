import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import { NextSeo } from "next-seo";
import Challenges from "@modules/challenges";
import seoDefaultConfig from "@utils/seo";

function ChallengesPage() {
  return (
    <>
      <NextSeo
        title="Daily challenges"
        description={"Daily challenges | " + seoDefaultConfig.description}
      />
      <Challenges />
    </>
  );
}

ChallengesPage.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default ChallengesPage;
