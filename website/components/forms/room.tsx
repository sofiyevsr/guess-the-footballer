import { useMutation } from "@tanstack/react-query";
import React from "react";
import clsx from "classnames";
import { useForm, SubmitHandler } from "react-hook-form";
import { globalQueryClient } from "utils/queryClient";
import { ArenaService } from "utils/services/arena";
import { NewRoomModal } from "@cmpt/pages/arenaRooms/newRoomModal";
import { useMe } from "utils/hooks/requests/useMe";

interface IFormInput {
  nonPublic: boolean;
  size: string;
}

export const RoomForm = () => {
  const { data: user } = useMe();
  const {
    isLoading: isSubmitting,
    mutate,
    reset,
    data: newRoom,
  } = useMutation({
    mutationFn: ({ size, nonPublic }: { size: number; nonPublic: boolean }) =>
      ArenaService.createRoom({ size, nonPublic }),
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

  const { register, handleSubmit } = useForm<IFormInput>({
    defaultValues: { size: "2", nonPublic: false },
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) =>
    mutate({ size: Number.parseInt(data.size), nonPublic: data.nonPublic });

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-xl font-bold">Create new room</h1>
        <div className="form-control w-full max-w-xs">
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
        <div className="form-control">
          <label className="cursor-pointer label">
            <span className="label-text">Private (Not listed in rooms)</span>
          </label>
          <input
            {...register("nonPublic")}
            type="checkbox"
            className="toggle toggle-primary"
          />
        </div>
        <button
          type="submit"
          disabled={user == null}
          className={clsx("btn btn-primary my-2", {
            loading: isSubmitting,
          })}
        >
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
