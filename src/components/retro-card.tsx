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
import { socket } from "@/socket";

import {
  addVoteToPost,
  createPost,
  destroyPost,
  editRetroSectionTitle,
  removeVoteFromPost,
  revalidate,
} from "@/app/actions";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { RetrospectiveSection } from "@/types/Retro";
import { useUserSession } from "@/hooks/user-session-context";
import { cn } from "@/lib/utils";
import { decryptMessage, encryptMessage } from "@/app/utils";
import { nanoid } from "nanoid";

interface RetroCardProps {
  title: string;
  description?: string;
  section: RetrospectiveSection;
  adminId: string;
}

export function RetroCard({
  title,
  description,
  section,
  adminId,
}: RetroCardProps) {
  const { userSession } = useUserSession();
  const postFormRef = useRef<HTMLFormElement>(null);

  const [isWriting, setIsWriting] = useState(false);
  const [isEditingSectionTitle, setIsEditingSectionTitle] =
    useState<boolean>(false);
  const [newSectionTitle, setNewSectionTitle] = useState(title);

  const [optimisticTitle, addOptimisticTitle] = useOptimistic(section.title);
  const [optimisticPosts, addOptimisticPosts] = useOptimistic(section.posts);

  const retrospectiveId = section.retrospectiveId;
  const isCurrentUserAdmin = adminId === userSession?.id;
  const sortedPostsByVotes = optimisticPosts.sort(
    (a, b) => b.votes.length - a.votes.length,
  );

  useEffect(() => {
    socket.on("posts", () => {
      revalidate();
    });

    socket.on("writing", (sectionId: string) => {
      if (section.id === sectionId) {
        setIsWriting(true);
      }
    });

    socket.on("stop-writing", (id: string) => {
      if (section.id === id) {
        setIsWriting(false);
      }
    });

    socket.on("vote-post", (sectionId) => {
      if (section.id === sectionId) {
        revalidate();
      }
    });

    socket.on("remove-vote-post", (sectionId) => {
      if (section.id === sectionId) {
        revalidate();
      }
    });

    socket.on("delete-post", async (sectionId) => {
      if (section.id === sectionId) {
        await revalidate();
      }
    });

    socket.on("retro-ended", async (content) => {
      console.log("termina y revalida");
      socket.emit("retro-ended-user", retrospectiveId, content);
      await revalidate();
    });

    return () => {
      socket.off("posts");
      socket.off("writing");
      socket.off("stop-writing");
      socket.off("delete-post");
      socket.off("vote-post");
      socket.off("remove-vote-post");
      socket.off("retro-ended");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!userSession) {
    return null;
  }

  const handleNewPostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    socket.emit("writing", retrospectiveId, section.id);

    if (e.target.value === "") {
      socket.emit("stop-writing", retrospectiveId, section.id);
      return;
    }
  };

  const handleSavePost = async (formData: FormData) => {
    const postContent = formData.get("content") as string;

    socket.emit("stop-writing", retrospectiveId, section.id);

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
      socket.emit("posts", retrospectiveId, newPost);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleDestroyPost = async (postId: string) => {
    startTransition(() => {
      addOptimisticPosts((prev) => prev.filter((post) => post.id !== postId));
    });

    await destroyPost({ postId });
    socket.emit("delete-post", retrospectiveId, section.id, postId);
  };

  const handleChangeSectionTitle = async () => {
    addOptimisticTitle(newSectionTitle);

    await editRetroSectionTitle({
      title: newSectionTitle,
      sectionId: section.id,
    });

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
      socket.emit("remove-vote-post", retrospectiveId, section.id, postId);
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
      socket.emit("vote-post", retrospectiveId, section.id, postId);
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
                const canVote = userSession.id !== post.userId;
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
