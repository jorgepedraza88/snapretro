"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

export function CreateRetroForm() {
  const [step, setStep] = useState(1);

  const progressPercentage = (step / 4) * 100;

  return (
    <div className="w-full">
      <div className="mt-4">
        <Progress value={progressPercentage} className="h-2" />
      </div>
      <form className="mt-16">
        {step === 1 && (
          <div className="flex justify-between items-center">
            Select your avatar
            <div className="w-full text-sm space-y-1">
              <label htmlFor="name">Name</label>
              <Input id="name" placeholder="Enter your name" />
            </div>
          </div>
        )}
      </form>
      <div className="mt-8 flex w-full justify-end gap-4">
        {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
        <Button onClick={() => setStep(2)}>Next</Button>
      </div>
    </div>
  );
}
