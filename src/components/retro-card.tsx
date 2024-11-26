import { ProvisionalDataItem } from "./retro-card-group";
import { Card, CardTitle, CardDescription } from "./ui/card";
import { Textarea } from "./ui/textarea";

interface RetroCardProps {
  title: string;
  description?: string;
  data: ProvisionalDataItem[];
}

export function RetroCard({ title, description, data }: RetroCardProps) {
  return (
    <Card className="w-72 min-h-40 flex flex-col justify-between">
      <div className="p-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      <div>
        {data.length > 0 ? (
          data.map((item) => (
            <Card key={item.id} className="mx-2">
              <div className="p-2 text-sm">{item.content}</div>
            </Card>
          ))
        ) : (
          <div className="p-2 text-sm text-gray-400">
            Start adding new items!
          </div>
        )}
      </div>
      <div className="mx-2 pt-10 pb-4">
        <Textarea className="p-2 text-sm" />
      </div>
    </Card>
  );
}
