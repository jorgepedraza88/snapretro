import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { CreateRetroForm } from './components/CreateRetroForm';

export default function Page() {
  return (
    <div className="flex h-screen justify-center bg-gray-100 p-4 font-[family-name:var(--font-geist-sans)] dark:bg-neutral-800">
      <div className="py-24">
        <h1 className="text-4xl font-medium dark:text-neutral-100">Create your Retrospective</h1>
        <main className="flex max-w-2xl flex-col items-center justify-center">
          <CreateRetroForm />
          <div className="mt-8 text-xs text-gray-500">
            Don&apos;t want to create a retrospective?
            <Button variant="link" className="text-sm" asChild>
              <Link href="/">Go to main</Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
