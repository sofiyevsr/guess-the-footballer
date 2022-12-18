import React from "react";
import { getUnixDateInUTC } from "utils/common";
import { useDBUpdateDate } from "utils/hooks/requests/useDBUpdateDate";

export const LastDBUpdate = () => {
  const { data } = useDBUpdateDate();
  if (data == null) return <></>;
  return (
    <div className="flex justify-between">
      <span className="p-0 font-bold text-md">
        Players&apos; database updated:
      </span>
      <span className="p-0 text-center font-bold">
        {getUnixDateInUTC(data.date).format("LL")}
      </span>
    </div>
  );
};
