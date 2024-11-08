import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import { NextSeo } from "next-seo";
import GameListForm from "components/forms/gameList";
import seoDefaultConfig from "@utils/seo";

function SubmitGameListPage() {
  return (
    <>
      <NextSeo
        title="Submit new game list"
        description={"Submit new game list | " + seoDefaultConfig.description}
      />
      <GameListForm />
    </>
  );
}

SubmitGameListPage.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default SubmitGameListPage;
