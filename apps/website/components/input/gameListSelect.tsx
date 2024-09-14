import React from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import useDebouncedValue from "@utils/hooks/useDebouncedValue";
import useIsFirstRender from "@utils/hooks/useIsFirstRender";
import { GameListService } from "@utils/services/gameList";
import { Control, Controller } from "react-hook-form";
import Select from "react-select";
import { STORAGE_URL } from "@utils/constants";

interface IFormInput {
  nonPublic: boolean;
  size: string;
  listID: string;
  levels: string;
  durationBetweenLevels: string;
  tipRevealingInterval: string;
}

interface Props {
  control: Control<IFormInput, any>;
}

function GameListSelect({ control }: Props) {
  const isFirstRender = useIsFirstRender();
  const [query, setQuery] = useDebouncedValue("");
  const { data, isLoading } = useQuery(["list_search", query], {
    staleTime: 0,
    cacheTime: Infinity,
    queryFn: () => GameListService.searchGameList(query),
  });

  return (
    <Controller
      control={control}
      name="listID"
      rules={{ required: { value: true, message: "List is required" } }}
      render={({ field: { onChange, onBlur, ref } }) => (
        <Select
          instanceId={"game list input"}
          onBlur={onBlur}
          ref={ref}
          onInputChange={(input) => setQuery(input)}
          onChange={(prop) => onChange(prop?.value)}
          className="h-full select p-0 !text-[rgb(166,173,186)]"
          options={data?.gameLists.map(({ id, name, imageKey, official }) => ({
            value: id,
            label: name,
            imageKey,
            official,
          }))}
          formatOptionLabel={(option) => (
            <div className="flex gap-2 items-center">
              <Image
                src={STORAGE_URL + "/" + option.imageKey}
                alt={option.label + " image"}
                height={40}
                width={40}
                className="h-10 w-10 object-contain bg-white p-1 rounded-lg"
              />
              <p className="flex-1">{option.label}</p>
              {option.official ? (
                <div className="badge badge-primary">Official</div>
              ) : (
                <div className="badge badge-secondary">Community</div>
              )}
            </div>
          )}
          placeholder="Type to filter lists"
          isClearable
          classNames={{
            input: () => "!text-[rgb(166,173,186)]",
            singleValue: () => "!text-[rgb(166,173,186)]",
            control: () =>
              "w-full h-full !bg-[hsl(var(--b1)/var(--tw-bg-opacity))] !border-0 !shadow-none !cursor-pointer",
            menu: () => "!bg-[hsl(var(--b1)/var(--tw-bg-opacity))]",
            menuList: () =>
              "!p-0 rounded-lg shadow-xl !border-2 border-gray-400",
            option: () =>
              "!bg-[hsl(var(--b1)/var(--tw-bg-opacity))] !cursor-pointer !py-1 !rounded-none hover:!bg-primary",
          }}
          isLoading={!isFirstRender && isLoading}
        />
      )}
    />
  );
}

export default GameListSelect;
