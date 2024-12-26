import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export function CreateRetroSecond() {
  const { register, watch } = useFormContext();

  const enablePassword = watch("enablePassword");

  return (
    <div className="mb-8">
      <h3 className="mb-4 font-medium">
        Configure your retrospective meeting:
      </h3>
      <div className="w-full space-y-1">
        <div className="flex items-center gap-1">
          <Controller
            name="enableChat"
            render={({ field }) => (
              <Checkbox
                id="enable-chat"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <label htmlFor="enable-chat">Enable chat</label>
        </div>
        <div className="flex items-center gap-1">
          <Controller
            name="timer"
            render={({ field }) => (
              <Checkbox
                id="enable-timer"
                checked={!!field.value}
                onCheckedChange={() => {
                  if (field.value) {
                    field.onChange(null);
                  } else {
                    field.onChange(300);
                  }
                }}
              />
            )}
          />
          <label htmlFor="enable-timer">Enable timer ( 5 minutes )</label>
        </div>
        {/* <div className="flex items-center gap-1">
          <Controller
            name="allowVotes"
            render={({ field }) => (
              <Checkbox
                id="allow-votes"
                disabled
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <label className="text-gray-500" htmlFor="allow-votes">
            Allow votes (coming soon)
          </label>
        </div> */}
        <div className="flex items-center gap-1">
          <Controller
            name="enablePassword"
            render={({ field }) => (
              <Checkbox
                id="enable-password"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <label htmlFor="enable-password">Protect with a secret word</label>
        </div>
        {enablePassword && (
          <div className="pt-2 ml-4">
            <label>Choose your secret word</label>
            <Input type="password" {...register("password")} />
          </div>
        )}
      </div>
    </div>
  );
}
