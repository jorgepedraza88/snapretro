"use client";
import {
  HiPencil as EditIcon,
  HiArrowRight as ArrowRightIcon,
} from "react-icons/hi2";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

export function CreateRetroForm() {
  const [step, setStep] = useState(1);
  const [retroData, setRetroData] = useState({
    adminId: "",
    adminName: "",
    date: new Date(),
    timer: "",
  });

  const progressPercentage = (step / 3) * 100;

  return (
    <div className="w-full">
      <div className="mt-4">
        <Progress value={progressPercentage} className="h-2" />
      </div>
      <div className="mt-16">
        {step === 1 && (
          <div>
            <div className="w-full flex justify-center items-center">
              <Avatar className="size-40 hover:cursor-pointer relative group">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JP</AvatarFallback>
                <div className="absolute size-full flex justify-center items-center invisible group-hover:visible group-hover:opacity-40 bg-black">
                  <EditIcon size={32} className="text-white" />
                </div>
              </Avatar>
            </div>
            <div className="w-full text-sm space-y-1">
              <label htmlFor="name">Name</label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={retroData.adminName}
                onChange={(e) =>
                  setRetroData((prev) => ({
                    ...prev,
                    adminName: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 className="text-2xl">Choose your configuration</h3>
            <ul className="list-disc">
              <li>Limit the max number of participants</li>
              <li>Set the timer: default 5 minutes</li>
              <li>Allow votes</li>
              <li>Enable chat</li>
              <li>Set a password</li>
            </ul>
          </div>
        )}
      </div>
      <div className="mt-4 flex w-full justify-end gap-4">
        {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
        <Button onClick={() => setStep(step + 1)}>
          Continue
          <ArrowRightIcon size={24} />
        </Button>
      </div>
    </div>
  );
}
