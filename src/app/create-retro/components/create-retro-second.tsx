import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@hookform/error-message";

export function CreateRetroSecond() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const enablePassword = watch("enablePassword");

  return (
    <div className="mb-8">
      <h3 className="mb-4 font-medium">
        Configure your retrospective meeting:
      </h3>
      <div className="w-full space-y-1">
        <div className="flex items-center gap-2">
          <Controller
            name="enableChat"
            render={({ field }) => (
              <Switch
                id="enable-chat"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="enable-chat">Enable chat</Label>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="timer"
            render={({ field }) => (
              <Switch
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
          <Label htmlFor="enable-timer">Enable timer</Label>
        </div>
        {/* <div className="flex items-center gap-1">
          <Controller
            name="allowVotes"
            render={({ field }) => (
              <Switch
                id="allow-votes"
                disabled
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label className="text-gray-500" htmlFor="allow-votes">
            Allow votes (coming soon)
          </Label>
        </div> */}
        <div className="flex items-center gap-2">
          <Controller
            name="enablePassword"
            render={({ field }) => (
              <Switch
                id="enable-password"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="enable-password">Protect with a secret word</Label>
        </div>
        {enablePassword && (
          <div className="pt-2 ml-12">
            <Label htmlFor="password">Choose your secret word</Label>
            <Input id="password" {...register("password")} />
            <div className="text-xs text-red-500 mt-1">
              <ErrorMessage name="password" errors={errors} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
