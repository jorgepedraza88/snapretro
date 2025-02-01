import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default async function Page() {
  return (
    <div className="mx-auto flex h-screen w-full max-w-5xl flex-col items-center justify-center p-16">
      <p className="mb-2">😓 Ups! This retrospective session does not exist.</p>
      <Button asChild>
        <Link href="/">Back</Link>
      </Button>
    </div>
  );
}
