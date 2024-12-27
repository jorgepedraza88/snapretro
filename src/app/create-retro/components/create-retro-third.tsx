"use client";

import { Controller } from "react-hook-form";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export function CreateRetroThird() {
  return (
    <div className="my-10">
      <Label className="text-md">Select number of sections:</Label>
      <Controller
        name="sectionsNumber"
        render={({ field }) => (
          <div>
            <p className="text-lg text-center w-full">{field.value}</p>
            <Slider
              defaultValue={[3]}
              name="sections"
              min={1}
              max={4}
              step={1}
              value={[field.value]}
              onValueChange={(value) => field.onChange(value[0])}
            />
          </div>
        )}
      />
    </div>
  );
}
