import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GameListService } from "@utils/services/gameList";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import GameListFormStep1 from "./step1";
import GameListFormStep2 from "./step2";
import gameListSchema from "@utils/validations/gameListInput";
import { GameListFormData } from "./_utils/_types";

const GameListForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const formMethods = useForm<GameListFormData>({
    resolver: zodResolver(gameListSchema),
    mode: "onBlur",
  });

  const { isLoading: isSubmitting, mutate } = useMutation({
    mutationFn: (input: GameListFormData) =>
      GameListService.submitGameList(input),
    async onSuccess() {
      toast.success(
        "List submitted successfully, it will be available after our approval",
        { autoClose: 10000 }
      );
      formMethods.reset();
      setDirection(-1);
      setCurrentStep(1);
    },
  });

  const onSubmit: SubmitHandler<GameListFormData> = (data) => mutate(data);

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl flex flex-col gap-4 justify-center h-full"
      >
        <h4 className="my-4 font-bold text-center text-gray-400 sm:text-xl lg:text-4xl">
          Submit your own game list
        </h4>
        <p className="text-center text-gray-500">
          Design your own custom game lists by handpicking footballers, making
          them available for everyone to play once approved. Share your
          creativity and challenge the community with unique selections that
          test their football knowledge and skills!
        </p>
        <AnimatePresence mode="popLayout">
          {currentStep === 1 && (
            <motion.div key="step-1" className="overflow-hidden">
              <GameListFormStep1
              direction={direction}
                goForward={() => {
                  setDirection(1);
                  setCurrentStep((step) => {
                    if (step > 1) return step;
                    return step + 1;
                  });
                }}
              />
            </motion.div>
          )}
          {currentStep === 2 && (
            <motion.div key="step-2" className="overflow-hidden">
              <GameListFormStep2
              direction={direction}
                goBack={() => {
                  setDirection(-1);
                  setCurrentStep((step) => {
                    if (step < 2) return step;
                    return step - 1;
                  });
                }}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </FormProvider>
  );
};

export default GameListForm;
