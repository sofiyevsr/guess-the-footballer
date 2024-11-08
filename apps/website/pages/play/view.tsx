import { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import { GameService } from "utils/services/game";
import { useQuery } from "@tanstack/react-query";
import LoadingLayout from "@cmpt/layout/loading";
import LocalPlayView from "@modules/play/localPlayView";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import seoDefaultConfig from "@utils/seo";

function LocalPlay() {
  const {
    query: { rounds, listID },
  } = useRouter();
  const { data, isError, refetch, isLoading, isPaused } = useQuery({
    queryKey: ["local_play", rounds, listID],
    enabled: !!rounds && !!listID,
    queryFn: () =>
      GameService.getPlayers({
        rounds: rounds as string,
        listID: listID as string,
      }),
  });

  return (
    <>
      <NextSeo
        title="Play infinite game"
        description={"Play infinite game | " + seoDefaultConfig.description}
      />
      <LoadingLayout
        isLoading={isLoading || isPaused}
        isError={isError}
        refetch={refetch}
      >
        <LocalPlayView players={data!} />
      </LoadingLayout>
    </>
  );
}

LocalPlay.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default LocalPlay;
