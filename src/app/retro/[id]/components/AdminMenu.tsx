"use client";

import { editRetroPassword, editRetroSectionsNumber } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { RetrospectiveData } from "@/types/Retro";
import { PopoverClose } from "@radix-ui/react-popover";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { HiCog8Tooth as AdminSettingsIcon } from "react-icons/hi2";
import { useRetroContext } from "./RetroContextProvider";
import { useState } from "react";

import {
  editAdminSettingsBroadcast,
  revalidatePageBroadcast,
} from "@/hooks/useRealtimeActions";

interface AdminMenuData {
  columns: number;
  password: string;
  allowNewParticipants: boolean;
  allowMessages: boolean;
  allowVotes: boolean;
}

export function AdminMenu({
  retrospectiveData,
}: {
  retrospectiveData: RetrospectiveData;
}) {
  const { adminSettings, hasRetroEnded, isCurrentUserAdmin, setAdminSettings } =
    useRetroContext();
  const { allowMessages, allowVotes } = adminSettings;
  const currentPassword = retrospectiveData.password || "";

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdminMenuData>({
    defaultValues: {
      columns: retrospectiveData.sections.length,
      password: currentPassword || "",
      allowMessages: allowMessages,
      allowVotes: allowVotes,
    },
  });

  const onSubmit = async (data: AdminMenuData) => {
    setIsSubmitting(true);
    if (data.columns !== retrospectiveData.sections.length) {
      await editRetroSectionsNumber(retrospectiveData.id, data.columns);
    }

    if (data.password !== currentPassword) {
      await editRetroPassword(retrospectiveData.id, data.password);
    }

    setAdminSettings((prev) => ({
      ...prev,
      allowMessages: data.allowMessages,
      allowVotes: data.allowVotes,
    }));

    await editAdminSettingsBroadcast(
      retrospectiveData.id,
      data.allowMessages,
      data.allowVotes,
    );

    await revalidatePageBroadcast(retrospectiveData.id);

    setIsPopoverOpen(false);
    setIsSubmitting(false);
  };

  if (!isCurrentUserAdmin || hasRetroEnded) {
    return null;
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="absolute top-20 -right-8"
          size="icon"
        >
          <AdminSettingsIcon size={16} />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="text-sm bg-neutral-50 w-fit ">
        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Label>Number of columns:</Label>
            <Controller
              name="columns"
              control={form.control}
              render={({ field }) => (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn("border rounded-r-none", {
                      "bg-violet-500 text-white": field.value === 2,
                    })}
                    onClick={() => field.onChange(2)}
                  >
                    2
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn("border rounded-none", {
                      "bg-violet-500 text-white": field.value === 3,
                    })}
                    onClick={() => field.onChange(3)}
                  >
                    3
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn("border rounded-l-none", {
                      "bg-violet-500 text-white": field.value === 4,
                    })}
                    onClick={() => field.onChange(4)}
                  >
                    4
                  </Button>
                </div>
              )}
            />

            <div>
              <Label>Secret word:</Label>
              <Input {...form.register("password")} />
            </div>
            <div>
              <Label>During meeting:</Label>
              <div className="flex items-center gap-2 mt-2">
                <Controller
                  name="allowMessages"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label>Allow messages</Label>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Controller
                  name="allowVotes"
                  control={form.control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label>Allow votes</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <PopoverClose asChild>
                <Button variant="outline">Cancel</Button>
              </PopoverClose>
              <Button type="submit" disabled={isSubmitting}>
                Apply
              </Button>
            </div>
          </form>
        </FormProvider>
      </PopoverContent>
    </Popover>
  );
}
