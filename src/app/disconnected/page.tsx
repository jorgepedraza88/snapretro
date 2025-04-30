import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default async function Page() {
  return (
    <div className="mx-auto flex h-screen w-full max-w-5xl flex-col items-center justify-center p-16">
      <p className="mb-2">🚫 You have been kicked from the retrospetive meeting</p>
      <Button asChild>
        <Link href={ROUTES.HOME}>Back to main page</Link>
      </Button>
    </div>
  );
}
