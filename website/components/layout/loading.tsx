import Spinner from "@cmpt/progress/spinner";
import React from "react";

interface Props {
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
  children: JSX.Element | undefined;
}

function LoadingLayout({
  isLoading,
  isError,
  refetch,
  children,
}: Props): JSX.Element {
  if (isLoading === true) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (isError === true) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="my-2 text-xl font-bold">
            Error occured while fetching data
          </div>
          <button className="btn btn-outline btn-error" onClick={refetch}>
            Retry
          </button>
        </div>
      </div>
    );
  }
  return children ?? <></>;
}

export default LoadingLayout;
