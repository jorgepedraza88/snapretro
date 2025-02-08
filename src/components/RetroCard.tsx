'use client';

import { startTransition, useEffect, useOptimistic, useRef, useState } from 'react';
import {
  HiPencil as EditIcon,
  HiTrash as RemoveIcon,
  HiHandThumbUp as VoteIcon,
  HiOutlineChatBubbleOvalLeftEllipsis as WritingIcon
} from 'react-icons/hi2';
import { MdKeyboardReturn as EnterIcon } from 'react-icons/md';
import { nanoid } from 'nanoid';
import { useShallow } from 'zustand/shallow';

import { RetrospectiveSection } from '@/types/Retro';
import { useRealtimeActions } from '@/hooks/useRealtimeActions';
import {
  addVoteToPost,
  createPost,
  destroyPost,
  editRetroSectionTitle,
  removeVoteFromPost
} from '@/app/actions';
import { decryptMessage, encryptMessage } from '@/app/utils';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/stores/useAdminStore';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { supabase } from '@/supabaseClient';
import { Button } from './ui/button';
import { Card, CardDescription, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface RetroCardProps {
  title: string;
  description?: string;
  section: RetrospectiveSection;
}

export function RetroCard({ title, description, section }: RetroCardProps) {
  const { currentUser, adminId } = usePresenceStore(
    useShallow((state) => ({
      adminId: state.adminId,
      currentUser: state.currentUser
    }))
  );
  const adminSettings = useAdminStore((state) => state.settings);
  const { writingAction, revalidatePageBroadcast } = useRealtimeActions();
  const postFormRef = useRef<HTMLFormElement>(null);

  const [isWriting, setIsWriting] = useState(false);
  const [isEditingSectionTitle, setIsEditingSectionTitle] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState(title);

  const [optimisticTitle, addOptimisticTitle] = useOptimistic(section.title);
  const [optimisticPosts, addOptimisticPosts] = useOptimistic(section.posts);

  const retrospectiveId = section.retrospectiveId;
  const isCurrentUserAdmin = adminId === currentUser.id;

  const sortedPostsByVotes = optimisticPosts.sort((a, b) => b.votes.length - a.votes.length);

  useEffect(() => {
    const channel = supabase.channel(`retrospective:${retrospectiveId}`);

    channel
      .on('broadcast', { event: 'writing' }, ({ payload }) => {
        if (section.id === payload.sectionId && currentUser.id !== payload.userId) {
          setIsWriting(true);
        }
      })
      .on('broadcast', { event: 'stop-writing' }, ({ payload }) => {
        if (section.id === payload.sectionId) {
          setIsWriting(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewPostChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isWriting) {
      writingAction(retrospectiveId, section.id, currentUser.id, 'start');
    }

    if (e.target.value === '') {
      writingAction(retrospectiveId, section.id, currentUser.id, 'stop');

      return;
    }
  };

  const handleSavePost = async (formData: FormData) => {
    const postContent = formData.get('content') as string;

    writingAction(retrospectiveId, section.id, currentUser.id, 'stop');

    try {
      const temporalId = nanoid(5);
      const encryptedPostContent = encryptMessage(postContent);

      const newPost = {
        id: temporalId,
        userId: currentUser.id,
        content: encryptedPostContent,
        votes: []
      };

      addOptimisticPosts((prev) => [...prev, { ...newPost, content: encryptedPostContent }]);

      postFormRef.current?.reset();

      await createPost({
        sectionId: section.id,
        newPost
      });

      revalidatePageBroadcast(retrospectiveId);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDestroyPost = async (postId: string) => {
    startTransition(() => {
      addOptimisticPosts((prev) => prev.filter((post) => post.id !== postId));
    });

    await destroyPost({ postId });

    revalidatePageBroadcast(retrospectiveId);
  };

  const handleChangeSectionTitle = async () => {
    addOptimisticTitle(newSectionTitle);

    await editRetroSectionTitle({
      title: newSectionTitle,
      sectionId: section.id
    });

    revalidatePageBroadcast(retrospectiveId);

    setIsEditingSectionTitle(false);
  };

  const handlePostVoting = async (postId: string, hasVoted: boolean) => {
    if (hasVoted) {
      startTransition(() => {
        addOptimisticPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                votes: post.votes.filter((id) => id !== currentUser.id)
              };
            }
            return post;
          })
        );
      });
      await removeVoteFromPost(postId, currentUser.id);

      revalidatePageBroadcast(retrospectiveId);
    } else {
      startTransition(() => {
        addOptimisticPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                votes: [...post.votes, currentUser.id]
              };
            }
            return post;
          })
        );
      });
      await addVoteToPost(postId, currentUser.id);
      revalidatePageBroadcast(retrospectiveId);
    }
  };

  return (
    <div className="h-full">
      <Card className="flex h-full flex-col justify-between bg-gray-100 pb-4 dark:bg-neutral-900">
        <div>
          <div className="group mb-2 rounded-t-lg bg-gray-200 p-2 dark:bg-neutral-700">
            <CardTitle className="flex items-center justify-between text-lg">
              {isEditingSectionTitle ? (
                <form action={handleChangeSectionTitle}>
                  <Input
                    value={newSectionTitle}
                    className="w-full"
                    name="title"
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    onBlur={() => setIsEditingSectionTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsEditingSectionTitle(false);
                      }
                    }}
                    autoFocus
                  />
                </form>
              ) : (
                optimisticTitle
              )}
              {isCurrentUserAdmin && !isEditingSectionTitle && (
                <Button
                  size="icon"
                  className="bg-invisible invisible text-gray-900 hover:bg-gray-300 group-hover:visible"
                  onClick={() => setIsEditingSectionTitle(true)}
                >
                  <EditIcon size={24} className="shrink-0" />
                </Button>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div>
            <form
              ref={postFormRef}
              action={handleSavePost}
              className="group mx-2 mb-4 flex items-center rounded-md border bg-white pr-2 focus-within:outline-[1px] focus-within:outline-offset-0 focus-within:ring-[1px] focus-within:ring-violet-500 dark:bg-neutral-800"
            >
              <Input
                disabled={!adminSettings.allowMessages}
                name="content"
                className="border-0 p-2 text-sm focus:outline-none focus-visible:outline-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Write something..."
                onChange={handleNewPostChange}
              />
              <Button type="submit" size="sm" variant="secondary" className="h-8 p-1.5 text-xs">
                <EnterIcon className="shrink-0" size={14} />
              </Button>
            </form>

            {sortedPostsByVotes.length > 0 ? (
              sortedPostsByVotes.map((post) => {
                const hasVoted = post.votes.includes(currentUser.id);
                const canVote = currentUser.id !== post.userId && adminSettings.allowVotes;
                const canDetroyPost = currentUser.id === post.userId;
                const postContent = decryptMessage(post.content);

                return (
                  <Card key={post.id} className="group mx-2 my-2">
                    <div className="flex items-center justify-between gap-2 p-2 text-sm">
                      <p>{postContent}</p>
                      <div className="flex items-center gap-2">
                        <div className="mt-px text-xs">
                          {post.votes.length !== 0 && `+${post.votes.length}`}
                        </div>
                        {canVote && (
                          <Button
                            variant="ghost"
                            className={cn('invisible h-auto p-1.5 group-hover:visible', {
                              'visible text-violet-500': hasVoted
                            })}
                            onClick={() => handlePostVoting(post.id, hasVoted)}
                          >
                            <VoteIcon className="shrink-0" />
                          </Button>
                        )}
                        {canDetroyPost && (
                          <Button
                            variant="ghost"
                            className="h-auto p-1.5"
                            onClick={() => handleDestroyPost(post.id)}
                          >
                            <RemoveIcon className="shrink-0" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="p-2 text-sm text-gray-400">Write anything</div>
            )}
          </div>
        </div>
      </Card>
      {isWriting && (
        <div className="mb-2 mt-2 flex gap-1">
          <WritingIcon className="text-gray-500" />
          <span className="text-xs text-gray-500">Someone is writing...</span>
        </div>
      )}
    </div>
  );
}
