"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Components
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  HiOutlineUserPlus as JoinIcon,
  HiArrowRight as GoRetroIcon,
} from "react-icons/hi2";
import { ImSpinner as SpinnerIcon } from "react-icons/im";

export function JoinRetroButton() {
  const router = useRouter();
  const [retroId, setRetroId] = useState("");
  const [isAddingId, setIsAddingId] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmitRetroId = (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    e.preventDefault();
    // TODO: Check if valid ID and then redirect
    router.push(`/retro/${retroId}`);
  };

  const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.trim() === "") {
      setIsAddingId(false);
    }
  };

  if (isAddingId) {
    return (
      <form onSubmit={onSubmitRetroId} className="flex w-full gap-2">
        <Input
          className="w-full min-w-48"
          placeholder="Enter a #Retro ID"
          onChange={(e) => setRetroId(e.target.value)}
          onBlur={onBlur}
          tabIndex={0}
          autoFocus
        />
        <Button type="submit" variant="secondary" disabled={isLoading}>
          {isLoading ? (
            <SpinnerIcon className="animate-spin" />
          ) : (
            <GoRetroIcon size={24} />
          )}
        </Button>
      </form>
    );
  }

  return (
    <Button variant="outline" size="lg" className="w-full lg:w-auto" onClick={() => setIsAddingId(true)}>
      <JoinIcon size={24} />
      Join into a retrospective
    </Button>
  );
}
