import { useMutation } from "@tanstack/react-query";
import React from "react";
import clsx from "classnames";
import { useForm, SubmitHandler } from "react-hook-form";
import { SessionService } from "utils/services/session";
import { globalQueryClient } from "utils/queryClient";
import { formatUnixTimestamp } from "utils/common";
import { useMe } from "utils/hooks/requests/useMe";

interface IFormInput {
  username: string;
}

export const SessionForm = () => {
  const { data: user, isLoading: isLoadingUser } = useMe();
  const { isLoading: isSubmitting, mutate } = useMutation({
    mutationFn: (username: string) =>
      SessionService.createSession({ username }),
    onSuccess() {
      globalQueryClient.invalidateQueries(["me"]);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = (data) => mutate(data.username);

  if (user != null) {
    return (
      <div>
        <p>
          <span className="font-bold">Username: </span>
          {user.username}
        </p>
        <p>
          <span className="font-bold">Joined: </span>
          {formatUnixTimestamp(user.created_at, "LLLL")}
        </p>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Create username</span>
        </label>
        <input
          {...register("username", {
            required: { value: true, message: "Username is required" },
            minLength: {
              value: 2,
              message: "Username length can be minimum 2",
            },
            maxLength: {
              value: 32,
              message: "Username length size can be maximum 32",
            },
          })}
          aria-invalid={errors.username ? "true" : "false"}
          type="text"
          placeholder="Type username here..."
          className={clsx("input input-bordered w-full max-w-xs", {
            "input-error": !!errors.username,
          })}
        />
        {errors.username && (
          <p role="alert" className="label py-0 text-error text-sm">
            {errors.username.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting || isLoadingUser}
        className={clsx("btn btn-primary my-2", {
          loading: isSubmitting || isLoadingUser,
        })}
      >
        Submit
      </button>
    </form>
  );
};
