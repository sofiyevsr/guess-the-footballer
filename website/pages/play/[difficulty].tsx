import Head from "next/head";
import { ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import type { GetStaticPaths, InferGetStaticPropsType } from "next";
import { gameDifficulties } from "utils/services/game/types/game";
import { GameService } from "utils/services/game";
import { useQuery } from "@tanstack/react-query";
import LoadingLayout from "@cmpt/layout/loading";
import LocalPlayView from "@cmpt/pages/localPlay";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: gameDifficulties.map((difficulty) => ({
      params: { difficulty },
    })),
    fallback: false,
  };
};

export const getStaticProps = async ({
  params,
}: {
  params: { difficulty: (typeof gameDifficulties)[number] };
}) => {
  return { props: { difficulty: params.difficulty } };
};

function LocalPlay({
  difficulty,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data, isError, refetch, isLoading } = useQuery({
    queryKey: ["local_play", difficulty],
    queryFn: () => GameService.getPlayers(difficulty),
  });
  return (
    <>
      <Head>
        <title>Play</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LoadingLayout isLoading={isLoading} isError={isError} refetch={refetch}>
        <LocalPlayView players={data!} />
      </LoadingLayout>
    </>
  );
}

LocalPlay.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default LocalPlay;
