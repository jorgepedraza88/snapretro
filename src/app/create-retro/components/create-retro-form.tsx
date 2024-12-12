"use client";
import { useState } from "react";
import { HiArrowRight as ArrowRightIcon } from "react-icons/hi2";

import { Button } from "@/components/ui/button";

import { Progress } from "@/components/ui/progress";
import { FormProvider, useForm } from "react-hook-form";
import { nanoid } from "nanoid";
import { CreateRetroFirst } from "./create-retro-first";
import { CreateRetroSecond } from "./create-retro-second";

export function CreateRetroForm() {
  const [step, setStep] = useState(1);

  const form = useForm({
    defaultValues: {
      adminId: `admin-${nanoid(5)}`,
      avatarUrl: "",
      adminName: "",
      date: new Date(),
      timer: 300,
      allowVotes: false,
      enableChat: true,
      enablePassword: false,
      password: null,
    },
  });

  const progressPercentage = (step / 3) * 100;

  const onSubmit = (data: any) => {
    setStep(step + 1);

    console.log(data);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="mt-4">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <div className="mt-16">
          {step === 1 && <CreateRetroFirst />}
          {step === 2 && <CreateRetroSecond />}
        </div>
        <div className="mt-4 flex w-full justify-end gap-4">
          {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
          <Button type="submit">
            {step < 3 ? "Next" : "Create"}
            <ArrowRightIcon size={24} />
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
