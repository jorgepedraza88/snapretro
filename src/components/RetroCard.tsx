"use client";

import {
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { Card, CardTitle, CardDescription } from "./ui/card";
import {
  HiOutlineChatBubbleOvalLeftEllipsis as WritingIcon,
  HiTrash as RemoveIcon,
  HiPencil as EditIcon,
  HiHandThumbUp as VoteIcon,
} from "react-icons/hi2";

import {
  addVoteToPost,
  createPost,
  destroyPost,
  editRetroSectionTitle,
  removeVoteFromPost,
  revalidatePageBroadcast,
  writingAction,
} from "@/app/actions";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { RetrospectiveSection } from "@/types/Retro";
import { cn } from "@/lib/utils";
import { decryptMessage, encryptMessage } from "@/app/utils";
import { nanoid } from "nanoid";
import { useRetroContext } from "@/app/retro/[id]/components/RetroContextProvider";
import { supabase } from "@/supabaseClient";

interface RetroCardProps {
  title: string;
  description?: string;
  section: RetrospectiveSection;
}

export function RetroCard({ title, description, section }: RetroCardProps) {
  const { userSession, isCurrentUserAdmin, adminSettings } = useRetroContext();
  const postFormRef = useRef<HTMLFormElement>(null);

  const [isWriting, setIsWriting] = useState(false);
  const [isEditingSectionTitle, setIsEditingSectionTitle] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState(title);

  const [optimisticTitle, addOptimisticTitle] = useOptimistic(section.title);
  const [optimisticPosts, addOptimisticPosts] = useOptimistic(section.posts);

  const retrospectiveId = section.retrospectiveId;

  const sortedPostsByVotes = optimisticPosts.sort(
    (a, b) => b.votes.length - a.votes.length,
  );

  useEffect(() => {
    const channel = supabase.channel(`retrospective:${retrospectiveId}`);

    channel
      .on("broadcast", { event: "writing" }, ({ payload }) => {
        if (
          section.id === payload.sectionId &&
          userSession.id !== payload.userId
        ) {
          setIsWriting(true);
        }
      })
      .on("broadcast", { event: "stop-writing" }, ({ payload }) => {
        debugger;
        if (section.id === payload.sectionId) {
          setIsWriting(false);
        }
      });
  }, []);

  const handleNewPostChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!isWriting) {
      await writingAction(retrospectiveId, section.id, userSession.id, "start");
    }

    if (e.target.value === "") {
      await writingAction(retrospectiveId, section.id, userSession.id, "stop");

      return;
    }
  };

  const handleSavePost = async (formData: FormData) => {
    const postContent = formData.get("content") as string;

    await writingAction(retrospectiveId, section.id, userSession.id, "stop");

    try {
      const temporalId = nanoid(5);
      const encryptedPostContent = encryptMessage(postContent);

      const newPost = {
        id: temporalId,
        userId: userSession.id,
        content: encryptedPostContent,
        votes: [],
      };

      addOptimisticPosts((prev) => [
        ...prev,
        { ...newPost, content: encryptedPostContent },
      ]);

      postFormRef.current?.reset();

      await createPost({
        sectionId: section.id,
        newPost,
      });

      await revalidatePageBroadcast(retrospectiveId);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleDestroyPost = async (postId: string) => {
    startTransition(() => {
      addOptimisticPosts((prev) => prev.filter((post) => post.id !== postId));
    });

    await destroyPost({ postId });

    await revalidatePageBroadcast(retrospectiveId);
  };

  const handleChangeSectionTitle = async () => {
    addOptimisticTitle(newSectionTitle);

    await editRetroSectionTitle({
      title: newSectionTitle,
      sectionId: section.id,
    });

    await revalidatePageBroadcast(retrospectiveId);

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
                votes: post.votes.filter((id) => id !== userSession.id),
              };
            }
            return post;
          }),
        );
      });
      await removeVoteFromPost(postId, userSession.id);

      await revalidatePageBroadcast(retrospectiveId);
    } else {
      startTransition(() => {
        addOptimisticPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                votes: [...post.votes, userSession.id],
              };
            }
            return post;
          }),
        );
      });
      await addVoteToPost(postId, userSession.id);
      await revalidatePageBroadcast(retrospectiveId);
    }
  };

  return (
    <div className="h-full">
      <Card className="bg-gray-100 dark:bg-neutral-900 flex flex-col justify-between h-full pb-4">
        <div>
          <div className="p-4 bg-gray-200 dark:bg-neutral-700 rounded-t-lg mb-2 group">
            <CardTitle className="flex justify-between items-center">
              {isEditingSectionTitle ? (
                <form action={handleChangeSectionTitle}>
                  <Input
                    value={newSectionTitle}
                    className="w-full"
                    name="title"
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    onBlur={() => setIsEditingSectionTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
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
                  className="bg-invisible text-gray-900 invisible group-hover:visible hover:bg-gray-300"
                  onClick={() => setIsEditingSectionTitle(true)}
                >
                  <EditIcon size={24} className="shrink-0" />
                </Button>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div>
            {sortedPostsByVotes.length > 0 ? (
              sortedPostsByVotes.map((post) => {
                const hasVoted = post.votes.includes(userSession.id);
                const canVote =
                  userSession.id !== post.userId && adminSettings.allowVotes;
                const canDetroyPost = userSession.id === post.userId;
                const postContent = decryptMessage(post.content);

                return (
                  <Card key={post.id} className="mx-2 my-2 group">
                    <div className="p-2 text-sm flex justify-between items-center gap-2">
                      <p>{postContent}</p>
                      <div className="flex gap-2 items-center">
                        <div className="text-xs mt-px">
                          {post.votes.length !== 0 && `+${post.votes.length}`}
                        </div>
                        {canVote && (
                          <Button
                            variant="ghost"
                            className={cn(
                              "p-1.5 h-auto invisible group-hover:visible",
                              {
                                "text-violet-500 visible": hasVoted,
                              },
                            )}
                            onClick={() => handlePostVoting(post.id, hasVoted)}
                          >
                            <VoteIcon className="shrink-0" />
                          </Button>
                        )}
                        {canDetroyPost && (
                          <Button
                            variant="ghost"
                            className="p-1.5 h-auto "
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
        <form
          ref={postFormRef}
          action={handleSavePost}
          className="mx-2 mt-10 flex flex-col justify-end"
        >
          <Input
            disabled={!adminSettings.allowMessages}
            name="content"
            className="p-2 text-sm"
            onChange={handleNewPostChange}
          />
        </form>
      </Card>
      {isWriting && (
        <div className="mt-2 flex gap-1 mb-2">
          <WritingIcon className="text-gray-500" />
          <span className="text-xs text-gray-500">Someone is writing...</span>
        </div>
      )}
    </div>
  );
}
