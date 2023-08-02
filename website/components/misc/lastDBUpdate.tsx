import React from "react";
import { getUnixDateInUTC } from "utils/common";
import { useDBUpdateDate } from "utils/hooks/requests/useDBUpdateDate";

export const LastDBUpdate = () => {
  const { data } = useDBUpdateDate();
  if (data == null) return <></>;
  return (
    <>
      <span className="block p-0 font-bold text-center text-lg">
        Date players&apos; database updated
      </span>
      <span className="block p-0 text-center">
        {getUnixDateInUTC(data.date).format("LL")}
      </span>
    </>
  );
};
