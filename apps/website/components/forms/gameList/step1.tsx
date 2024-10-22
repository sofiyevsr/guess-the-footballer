import RevealAnimation from "@cmpt/misc/revealAnimation";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { AssetService } from "@utils/services/asset";
import React from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "react-toastify";
import { STORAGE_URL } from "@utils/constants";
import { GameListFormData } from "./_utils/_types";

interface Props {
  direction: number;
  goForward: () => void;
}

function GameListFormStep1({ goForward, direction }: Props) {
  const {
    watch,
    formState: { errors },
    trigger,
    setValue,
    register,
  } = useFormContext<GameListFormData>();

  const { isLoading: isSavingImage, mutate: saveImage } = useMutation({
    mutationFn: (input: File) => AssetService.uploadFile(input),
    async onSuccess({ filename }) {
      setValue("imageKey", filename, { shouldValidate: true });
    },
  });

  const imageKey = watch("imageKey");

  return (
    <RevealAnimation direction={direction}>
      <div className="flex flex-col md:gap-4 md:flex-row">
        <div className="form-control flex-1 md:whitespace-nowrap">
          <label className="cursor-pointer label">
            <span className="label-text">Name</span>
          </label>
          <input
            {...register("name")}
            placeholder="Enter name for the list"
            type="text"
            className="input input-bordered w-full"
          />
          {errors.name && (
            <p role="alert" className="label py-0 text-error text-sm">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="form-control flex-1 md:whitespace-nowrap">
          <label className="cursor-pointer label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            {...register("description")}
            placeholder="Enter short text briefly explaining the list"
            maxLength={256}
            className="input input-bordered w-full min-h-32 py-1"
          />
          {errors.description && (
            <p role="alert" className="label py-0 text-error text-sm">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <p className="label-text">Logo</p>
        <div className="flex items-center justify-center w-full my-4">
          <label className="flex flex-col items-center justify-center w-1/2 h-44 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-neutral text-neutral-content hover:bg-gray-800">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {imageKey ? (
                <Image
                  src={STORAGE_URL + "/" + imageKey}
                  alt={"list logo"}
                  height={140}
                  width={140}
                  className="object-contain"
                />
              ) : (
                <>
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    JPG, JPEG, PNG, or WEBP (max. 3mb)
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              disabled={isSavingImage}
              accept=".png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (!file) return toast.error("No file is selected");
                saveImage(file);
              }}
            />
          </label>
        </div>
        {errors.imageKey && (
          <p role="alert" className="label py-0 text-error text-sm">
            {errors.imageKey.message}
          </p>
        )}
      </div>
      <button
        type="button"
        className="btn btn-success w-full my-2"
        onClick={async () => {
          const valid = await trigger(["name", "description", "imageKey"]);
          if (!valid) return;
          goForward();
        }}
      >
        Proceed
      </button>
    </RevealAnimation>
  );
}

export default GameListFormStep1;
