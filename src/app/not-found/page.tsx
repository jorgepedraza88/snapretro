import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default async function Page() {
  return (
    <div className="mx-auto flex h-screen w-full max-w-5xl flex-col items-center justify-center p-8">
      <div className="bg-muted/30 flex flex-col items-center gap-6 rounded-xl p-10 text-center">
        <span className="text-6xl">🔍</span>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            We didn&apos;t find a retrospective meeting with this link
          </h1>
          <p className="text-muted-foreground">
            The link may have expired or the meeting might have been removed.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={ROUTES.HOME}>Back to main</Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.CREATE_RETRO}>Create new retro</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
