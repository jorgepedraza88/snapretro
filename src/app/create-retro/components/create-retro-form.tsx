"use client";
import { useState } from "react";
import { HiArrowRight as ArrowRightIcon } from "react-icons/hi2";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { Progress } from "@/components/ui/progress";
import { FormProvider, useForm } from "react-hook-form";
import { nanoid } from "nanoid";
import { CreateRetroFirst } from "./create-retro-first";
import { CreateRetroSecond } from "./create-retro-second";
import { createRetro } from "@/app/postActions";

export function CreateRetroForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const form = useForm({
    defaultValues: {
      id: nanoid(15),
      adminId: `admin-${nanoid(5)}`,
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

  const progressPercentage = (step / 3) * 100;

  const onSubmit = async (data: any) => {
    try {
      await createRetro(data);
    } catch (error) {
      console.log(error);
    } finally {
      router.push(`/retro/${data.id}`);
    }
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
          {step !== 3 && (
            <Button type="button" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          )}
          {step === 3 && (
            <Button type="submit">
              Let's begin
              <ArrowRightIcon size={24} />
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
