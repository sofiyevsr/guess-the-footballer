import type { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import { NextSeo } from "next-seo";
import GameListForm from "components/forms/gameList";

function SubmitGameListPage() {
  return (
    <>
      <NextSeo title="Submit new game list" />
      <GameListForm />
    </>
  );
}

SubmitGameListPage.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default SubmitGameListPage;
