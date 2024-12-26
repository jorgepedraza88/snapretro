"use client";
import { useState } from "react";
import { HiArrowRight as ArrowRightIcon } from "react-icons/hi2";
import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreateRetroFirst } from "./create-retro-first";
import { CreateRetroSecond } from "./create-retro-second";
import { createRetro } from "@/app/postActions";
import { useUserSession } from "@/hooks/user-session-context";

export function CreateRetroForm() {
  const router = useRouter();
  const { setUserSession } = useUserSession();

  const [step, setStep] = useState(1);
  const progressPercentage = (step / 3) * 100;

  const form = useForm({
    defaultValues: {
      id: nanoid(15),
      adminId: nanoid(5),
      avatarUrl: "",
      adminName: "",
      date: new Date(), // TODO: Isotimestamp
      timer: 300,
      allowVotes: false,
      enableChat: true,
      enablePassword: false,
      password: null,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await createRetro(data);
    } catch (error) {
      console.log(error);
    } finally {
      router.push(`/retro/${data.id}`);
    }
  };

  // Create user in session storage and go to next step
  const handleChangeStep = () => {
    if (step === 1) {
      const retroData = form.getValues();

      setUserSession({
        id: retroData.adminId,
        name: retroData.adminName,
        avatarUrl: retroData.avatarUrl,
      });

      setStep(2);

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
        </div>
        <div className="mt-4 flex w-full justify-end gap-4">
          {step > 1 && (
            <Button type="button" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step !== 3 && (
            <Button type="button" onClick={handleChangeStep}>
              Next
            </Button>
          )}
          {step === 3 && (
            <Button type="submit">
              Let&apos;s begin
              <ArrowRightIcon size={24} />
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
