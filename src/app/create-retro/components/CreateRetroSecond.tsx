import { Controller, useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { Duration } from 'luxon';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export function CreateRetroSecond() {
  const {
    register,
    watch,
    formState: { errors },
    setValue
  } = useFormContext();

  const enablePassword = watch('enablePassword');
  const timer = watch('timer');

  const formatTimer = (value: number) => {
    const milliseconds = value * 1000;
    const duration = Duration.fromObject({ milliseconds });
    const minutes = duration.toFormat('mm:ss');

    return minutes;
  };

  return (
    <div className="mb-8">
      <h3 className="mb-4 font-medium dark:text-neutral-100">
        Configure your retrospective meeting:
      </h3>
      <div className="w-full space-y-1">
        <div className="flex items-center gap-2">
          <Controller
            name="enableChat"
            render={({ field }) => (
              <Switch id="enable-chat" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Label htmlFor="enable-chat">Enable chat</Label>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="timer"
            render={({ field }) => (
              <div className="w-full">
                <div className="flex items-center gap-2">
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
                  <Label htmlFor="enable-timer">Enable timer</Label>
                </div>
              </div>
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="enablePassword"
            render={({ field }) => (
              <Switch id="enable-password" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Label htmlFor="enable-password">Protect with a secret word</Label>
        </div>
        {enablePassword && (
          <div className="ml-12 pt-2">
            <Label htmlFor="password">Choose your secret word</Label>
            <Input
              id="password"
              {...register('password', {
                required: true,
                minLength: 3
              })}
            />
            <div className="mt-1 text-xs text-red-500">
              <ErrorMessage name="password" errors={errors} />
            </div>
          </div>
        )}
      </div>
      {!!timer && (
        <div className="my-4 ml-12">
          <Label>Select time:</Label>
          <p className="w-full text-center text-sm dark:text-neutral-100">
            {formatTimer(timer)} minutes
          </p>
          <Slider
            defaultValue={[300]}
            max={600}
            min={60}
            step={30}
            value={[timer]}
            className="mt-1"
            onValueChange={(val) => setValue('timer', val[0])}
          />
        </div>
      )}
    </div>
  );
}
