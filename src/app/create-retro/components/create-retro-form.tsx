"use client";
import { useState } from "react";
import { HiArrowRight as ArrowRightIcon } from "react-icons/hi2";
import { ImSpinner as SpinnerIcon } from "react-icons/im";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { DateTime } from "luxon";
import { socket } from "@/socket";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreateRetroFirst } from "./create-retro-first";
import { CreateRetroSecond } from "./create-retro-second";
import { createRetro, CreateRetroSpectiveData } from "@/app/postActions";
import { useUserSession } from "@/hooks/user-session-context";
import { CreateRetroThird } from "./create-retro-third";

export function CreateRetroForm() {
  const router = useRouter();
  const { setUserSession } = useUserSession();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const progressPercentage = (step / 3) * 100;

  const form = useForm<CreateRetroSpectiveData>({
    defaultValues: {
      id: nanoid(15),
      adminId: nanoid(5),
      avatarUrl: "",
      adminName: "",
      date: DateTime.now().toISO(),
      timer: 300,
      allowVotes: false,
      enableChat: true,
      enablePassword: false,
      password: null,
      sectionsNumber: 3,
    },
  });

  const onSubmit = async (data: CreateRetroSpectiveData) => {
    setIsSubmitting(true);
    try {
      await createRetro(data);
      socket.emit("join-retrospective", data.id, data.adminName, true);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    } finally {
      router.push(`/retro/${data.id}`);
    }
  };

  // Create user in session storage and go to next step
  const handleChangeStep = () => {
    const retroData = form.getValues();
    if (step === 1) {
      setUserSession({
        id: retroData.adminId,
        name: retroData.adminName,
        avatarUrl: retroData.avatarUrl,
      });

      setStep(2);

      return;
    }
    // Validate if the password is empty
    if (retroData.enablePassword && !retroData.password) {
      form.setError("password", {
        type: "required",
        message: "Secret word is required",
      });
      return;
    }

    setStep(3);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (step !== 3) {
              e.preventDefault();
              handleChangeStep();
            }
          }
        }}
        className="w-full"
      >
        <div className="mt-4">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <div className="mt-16">
          {step === 1 && <CreateRetroFirst />}
          {step === 2 && <CreateRetroSecond />}
          {step === 3 && <CreateRetroThird />}
        </div>
        <div className="mt-4 flex w-full justify-end gap-4">
          {step > 1 && (
            <Button
              type="button"
              onClick={() => {
                form.clearErrors();
                setStep(step - 1);
              }}
            >
              Back
            </Button>
          )}
          {step !== 3 && (
            <Button type="button" onClick={handleChangeStep}>
              Next
            </Button>
          )}
          {step === 3 && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <SpinnerIcon className="animate-spin" />
              ) : (
                <>
                  Let&apos;s begin
                  <ArrowRightIcon size={24} />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
