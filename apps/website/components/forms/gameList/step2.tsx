import RevealAnimation from "@cmpt/misc/revealAnimation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import useDebouncedValue from "@utils/hooks/useDebouncedValue";
import useIsFirstRender from "@utils/hooks/useIsFirstRender";
import { GameListService } from "@utils/services/gameList";
import React from "react";
import { useFormContext } from "react-hook-form";
import Select from "react-select";
import { GameListFormData } from "./_utils/_types";

interface Props {
  direction: number;
  isSubmitting: boolean;
  goBack: () => void;
}

function GameListFormStep2({ direction, isSubmitting, goBack }: Props) {
  const { setValue, watch } = useFormContext<GameListFormData>();
  const isFirstRender = useIsFirstRender();
  const [query, setQuery] = useDebouncedValue("", 500);
  const { data, isLoading } = useQuery(["list_player_search", query], {
    enabled: !!query,
    staleTime: 0,
    cacheTime: Infinity,
    queryFn: () => GameListService.searchPlayer(query),
  });

  const value = watch("playerIds");

  return (
    <RevealAnimation direction={direction}>
      <Select
        instanceId={"player search input"}
        onInputChange={(input) => setQuery(input)}
        onChange={(prop) =>
          setValue(
            "playerIds",
            prop.map(({ id }) => id)
          )
        }
        className="w-full h-auto select px-0 !text-[rgb(166,173,186)]"
        options={data?.players.map((player) => ({
          value: player.id,
          label: player.playerName,
          ...player,
        }))}
        formatOptionLabel={(option) => (
          <div className="flex gap-2 items-center rounded-lg bg-neutral">
            <Image
              src={option.playerImage}
              alt={option.playerName + " image"}
              height={40}
              width={40}
              className="h-10 w-10 object-contain bg-white p-1 rounded-lg"
            />
            <p className="flex-1">
              {option.firstName} {option.lastName} - {option.club}
            </p>
          </div>
        )}
        placeholder="Type to find players"
        isMulti
        isClearable
        classNames={{
          input: () => "!text-[rgb(166,173,186)]",
          multiValueLabel: () =>
            "!text-[rgb(166,173,186)] bg-neutral !rounded-none",
          multiValueRemove: () => "bg-neutral !rounded-none",
          control: () =>
            "w-full h-full !bg-[hsl(var(--b1)/var(--tw-bg-opacity))] !border-0 !shadow-none !cursor-pointer",
          menu: () => "!bg-[hsl(var(--b1)/var(--tw-bg-opacity))]",
          menuList: () => "!p-0 rounded-lg shadow-xl !border-2 border-gray-400",
          option: () =>
            "!bg-[hsl(var(--b1)/var(--tw-bg-opacity))] !cursor-pointer !py-1 !rounded-none hover:!bg-primary",
        }}
        isLoading={!isFirstRender && isLoading && !!query}
      />
      <div className="divider">OR</div>
      <label className="label-text">
        Enter players&apos; transfermarkt ids if you know separated by comma
        (bulk import)
      </label>
      <input
        type="text"
        className="input input-bordered w-full"
        value={value?.join(",") ?? ""}
        onChange={(e) =>
          setValue("playerIds", e.currentTarget.value.split(","))
        }
      />
      <div className="label">
        <span className="label-text-alt text-warning">
          Use only if you know ids and make sure to use only one of the inputs
        </span>
      </div>
      <div className="label mb-2">
        <span className="label-text-alt text-warning">
          This input reflects current state of player ids
        </span>
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          className="btn btn-error my-2 flex-1"
          onClick={goBack}
        >
          Go back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-success my-2 flex-1"
        >
          {isSubmitting && <span className="loading loading-spinner" />}
          Submit the list
        </button>
      </div>
    </RevealAnimation>
  );
}

export default GameListFormStep2;
