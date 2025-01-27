"use client";

import { useState } from "react";
import { HiArrowRight as ArrowRightIcon } from "react-icons/hi2";
import { ImSpinner as SpinnerIcon } from "react-icons/im";
import { FormProvider, useForm } from "react-hook-form";
import { nanoid } from "nanoid";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreateRetroFirst } from "./CreateRetroFirst";
import { CreateRetroSecond } from "./CreateRetroSecond";
import { createRetro, CreateRetrospectiveData } from "@/app/actions";
import { useUserSession } from "@/components/UserSessionContext";
import { useRouter } from "next/navigation";

const defaultFormValues: CreateRetrospectiveData = {
  adminId: nanoid(5),
  avatarUrl: "",
  adminName: "",
  timer: 300,
  allowVotes: false,
  enableChat: true,
  enablePassword: false,
  password: null,
  sectionsNumber: 3,
};

export function CreateRetroForm() {
  const router = useRouter();
  const { setUserSession } = useUserSession();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const progressPercentage = (step / 3) * 100;

  const form = useForm<CreateRetrospectiveData>({
    defaultValues: defaultFormValues,
  });

  const onSubmit = async (data: CreateRetrospectiveData) => {
    setIsSubmitting(true);
    try {
      const retrospective = await createRetro(data);

      router.push(`/retro/${retrospective.id}`);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

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

    // Validate manually if the password is empty
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
            if (step !== 2) {
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
          {step !== 2 && (
            <Button
              variant="secondary"
              type="button"
              onClick={handleChangeStep}
            >
              Next
            </Button>
          )}
          {step === 2 && (
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
