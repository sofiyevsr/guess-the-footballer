import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { globalQueryClient } from "utils/queryClient";
import { ArenaService } from "utils/services/arena";
import { NewRoomModal } from "@modules/arenaRooms/newRoomModal";
import { useMe } from "utils/hooks/requests/useMe";
import GameListSelect from "@cmpt/input/gameListSelect";

interface IFormInput {
  nonPublic: boolean;
  size: string;
  listID: string;
  levels: string;
  durationBetweenLevels: string;
  tipRevealingInterval: string;
}

export const RoomForm = () => {
  const { data: user } = useMe();
  const {
    isLoading: isSubmitting,
    mutate,
    reset,
    data: newRoom,
  } = useMutation({
    mutationFn: (input: IFormInput) => ArenaService.createRoom(input),
    async onSuccess() {
      globalQueryClient.invalidateQueries({
        queryKey: ["rooms"],
        exact: true,
      });
      globalQueryClient.invalidateQueries({
        queryKey: ["my_rooms"],
        exact: true,
      });
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IFormInput>({
    defaultValues: {
      size: "2",
      levels: "5",
      tipRevealingInterval: "4",
      durationBetweenLevels: "45",
      nonPublic: false,
      listID: undefined,
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) => mutate(data);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h4 className="text-xl font-bold">Create new room</h4>
        <div className="flex flex-col md:gap-4 md:flex-row">
          <div className="form-control flex-1 w-full">
            <label className="label">
              <span className="label-text">Number of players</span>
            </label>
            <div className="btn-group my-1">
              {[2, 3, 4, 5].map((index) => (
                <input
                  {...register("size")}
                  key={index}
                  type="radio"
                  value={index}
                  data-title={index}
                  className="btn"
                />
              ))}
            </div>
          </div>
          <div className="form-control flex-1 md:whitespace-nowrap">
            <label className="cursor-pointer label">
              <span className="label-text">Private (Not listed publicly)</span>
            </label>
            <input
              {...register("nonPublic")}
              type="checkbox"
              className="toggle toggle-primary my-auto"
            />
          </div>
        </div>
        <div className="flex flex-col md:gap-4 md:flex-row">
          <div className="form-control flex-1 md:whitespace-nowrap">
            <label className="cursor-pointer label">
              <span className="label-text">Number of levels to be played</span>
            </label>
            <select {...register("levels")} className="select w-full">
              {Array.from(new Array(16)).map((_, index) => (
                <option key={index} value={index + 5}>
                  {index + 5} rounds
                </option>
              ))}
            </select>
          </div>
          <div className="form-control flex-1 md:whitespace-nowrap">
            <label className="cursor-pointer label">
              <span className="label-text">Interval to reveal a new tip</span>
            </label>
            <select
              {...register("tipRevealingInterval")}
              className="select w-full"
            >
              {Array.from(new Array(10)).map((_, index) => (
                <option key={index} value={index * 2 + 2}>
                  {index * 2 + 2} seconds
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col md:gap-4 md:flex-row">
          <div className="form-control flex-1 md:whitespace-nowrap">
            <label className="cursor-pointer label">
              <span className="label-text">Duration between levels</span>
            </label>
            <select
              {...register("durationBetweenLevels")}
              className="select w-full"
            >
              {Array.from(new Array(22)).map((_, index) => (
                <option key={index} value={index * 5 + 15}>
                  {index * 5 + 15} seconds
                </option>
              ))}
            </select>
          </div>

          <div className="form-control flex-1 md:whitespace-nowrap">
            <label className="cursor-pointer label">
              <span className="label-text">Pick up the game list</span>
            </label>
            <GameListSelect control={control} />
            <div className="label">
              <span className="h-1 label-text-alt text-error">
                {errors.listID?.message}
              </span>
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={user == null}
          className="btn btn-primary w-full my-2"
        >
          {isSubmitting && <span className="loading loading-spinner" />}
          Create room
        </button>
        {user == null && (
          <p role="alert" className="label py-0 text-error text-xs">
            Create a session before creating room
          </p>
        )}
      </form>
      <NewRoomModal reset={reset} room={newRoom?.room} />
    </>
  );
};
