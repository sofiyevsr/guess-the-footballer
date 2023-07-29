import { useMutation } from "@tanstack/react-query";
import React from "react";
import clsx from "classnames";
import { useForm, SubmitHandler } from "react-hook-form";
import { SessionService } from "utils/services/session";
import { globalQueryClient } from "utils/queryClient";
import { formatDate } from "utils/common";
import { useMe } from "utils/hooks/requests/useMe";
import UsernameChecker from "./usernameChecker";

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
    watch,
    formState: { errors },
  } = useForm<IFormInput>();

  const username = watch("username");

  const onSubmit: SubmitHandler<IFormInput> = (data) => mutate(data.username);

  if (user != null) {
    return (
      <div>
        <div>
          <p className="font-bold">Username: </p>
          <p className="prose">{user.username}</p>
        </div>
        <div>
          <p className="font-bold">Joined: </p>
          <p className="prose">{formatDate(user.created_at, "LLL")}</p>
        </div>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Create session</span>
        </label>
        <input
          {...register("username", {
            required: { value: true, message: "Username is required" },
            minLength: {
              value: 2,
              message: "Username length can be minimum 2",
            },
            maxLength: {
              value: 24,
              message: "Username length size can be maximum 24",
            },
          })}
          maxLength={24}
          autoComplete="off"
          aria-invalid={errors.username ? "true" : "false"}
          type="text"
          placeholder="Type username here..."
          className={clsx("input input-bordered w-full max-w-xs", {
            "input-error": !!errors.username,
          })}
        />
        <UsernameChecker username={username} />
        {errors.username && (
          <p role="alert" className="label py-0 text-error text-sm">
            {errors.username.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting || isLoadingUser}
        className="btn btn-primary w-full my-2"
      >
        {(isSubmitting || isLoadingUser) && (
          <span className="loading loading-spinner" />
        )}
        Submit
      </button>
    </form>
  );
};
