import { Suspense } from 'react';

import { RetrospectiveData, RetrospectiveSection } from '@/types/Retro';
import { decryptMessage, importKey } from '@/app/cryptoClient';
import { cn } from '@/lib/utils';
import { RetroCard } from './RetroCard';

export async function RetroCardGroup({
  retrospectiveData: retrospectiveData
}: {
  retrospectiveData: RetrospectiveData;
}) {
  const sectionsNumber = retrospectiveData.sections.length;

  // // Un helper asíncrono que devuelve la lista de posts descifrados.
  // async function getDecryptedPosts(posts: RetrospectiveSection['posts'], symmetricKey?: string) {
  //   if (!symmetricKey) return [];

  //   const cryptoKey = await importKey(symmetricKey);
  //   const postsDecrypted = await Promise.all(
  //     posts.map(async (post) => ({
  //       ...post,
  //       content: await decryptMessage(post.content, cryptoKey)
  //     }))
  //   );
  //   return postsDecrypted;
  // }

  return (
    <div
      className={cn('block w-full gap-4 space-y-4 lg:grid lg:space-y-0', {
        'grid-cols-1': sectionsNumber === 1,
        'grid-cols-2': sectionsNumber === 2,
        'grid-cols-3': sectionsNumber === 3,
        'grid-cols-4': sectionsNumber === 4
      })}
    >
      {retrospectiveData.sections.map((section) => (
        <RetroCard title={section.title} section={section} retrospectiveData={retrospectiveData} />
      ))}
    </div>
  );
}
