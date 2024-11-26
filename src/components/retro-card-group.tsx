import { RetroCard } from "./retro-card";

interface ProvisionalData {
  startDoing: ProvisionalDataItem[];
  whatToImprove: ProvisionalDataItem[];
  shoutouts: ProvisionalDataItem[];
}

export interface ProvisionalDataItem {
  id: string;
  content: string;
}

export function RetroCardGroup() {
  const data: ProvisionalData = {
    startDoing: [{ id: "1", content: "Start doing this, because is the best for the company and it's going to improve the productivity" }],
    whatToImprove: [],
    shoutouts: [],
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <RetroCard title="👍🏼 Start doing" data={data.startDoing} />
      <RetroCard title="🚨 What to improve" data={data.whatToImprove} />
      <RetroCard title="👏🏼 Shoutouts" data={data.shoutouts} />
    </div>
  );
}
