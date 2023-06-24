import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { Oswald } from "next/font/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { globalQueryClient } from "utils/queryClient";
import RouterProgressBar from "@cmpt/progress/routerProgressBar";
import { ToastContainer } from "react-toastify";
import { DefaultSeo } from "next-seo";
import seoDefaultConfig from "utils/seo";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const oswald = Oswald({
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <QueryClientProvider client={globalQueryClient}>
      <style jsx global>{`
        html {
          font-family: ${oswald.style.fontFamily};
        }
      `}</style>
      <RouterProgressBar />
      <DefaultSeo {...seoDefaultConfig} />
      {getLayout(<Component {...pageProps} />)}
      <ToastContainer
        position="bottom-left"
        theme="colored"
        className="text-lg text-center font-bold"
        autoClose={2000}
      />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
