import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Controller, useFormContext } from "react-hook-form";

export function CreateRetroSecond() {
  const { register, watch, getFieldState } = useFormContext();

  const enablePassword = watch("enablePassword");

  const errors = getFieldState("password")?.error;

  return (
    <div className="mb-8">
      <h3 className="text-2xl mb-8">Choose your configuration</h3>
      <div className="w-full text-sm space-y-1">
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
          <label className="text-lg" htmlFor="enable-chat">
            Enable chat
          </label>
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
          <label className="text-lg" htmlFor="enable-timer">
            Enable timer ( 5 minutes )
          </label>
        </div>
        <div className="flex items-center gap-1">
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
          <label className="text-lg text-gray-500" htmlFor="allow-votes">
            Allow votes (coming soon)
          </label>
        </div>
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
          <label className="text-lg" htmlFor="enable-password">
            Set a password
          </label>
        </div>
        {enablePassword && (
          <div className="pt-2">
            <label>Choose your password</label>
            <Input
              {...register("password", {
                required: true,
                minLength: 8,
              })}
            />
            <p className="mt-2 text-xs text-red-500">{errors && errors.type}</p>
          </div>
        )}
      </div>
    </div>
  );
}
