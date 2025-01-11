"use client";

import { useActionState, useEffect, useOptimistic, useState } from "react";
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
import { useParams } from "next/navigation";
import { useUserSession } from "@/hooks/user-session-context";
import { cn } from "@/lib/utils";

interface RetroCardProps {
  title: string;
  description?: string;
  section: RetrospectiveSection;
  adminId: string;
}

interface NewPost {
  content: string;
  userId: string;
  votes: string[];
}

const getDefaultPostState = (userId: string | undefined): NewPost => ({
  userId: userId || "",
  content: "",
  votes: [],
});

export function RetroCard({
  title,
  description,
  section,
  adminId,
}: RetroCardProps) {
  const params = useParams<{ id: string }>();
  const retrospectiveId = params.id;
  const { userSession } = useUserSession();

  const isCurrentUserAdmin = adminId === userSession?.id;
  const defaultPostState = getDefaultPostState(userSession?.id);

  const [newPost, setNewPost] = useState(defaultPostState);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  const [isEditingSectionTitle, setIsEditingSectionTitle] =
    useState<boolean>(false);
  const [newSectionTitle, setNewSectionTitle] = useState(title);
  // TODO: Mirar si es necesario o no, es guay en verdad
  const [optimisticTitle, addOptimisticTitle] = useOptimistic<string>(
    section.title,
  );

  useEffect(() => {
    socket.on("posts", () => {
      console.log("receiving posts");

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

    // socket.on("delete-post", async (sectionId, postId) => {
    //   if (section.id === sectionId) {
    //     revalidate();
    //   }
    // });

    return () => {
      socket.off("posts");
      socket.off("writing");
      socket.off("stop-writing");
      socket.off("delete-post");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!userSession) {
    return null;
  }

  const handleNewPostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    socket.emit("writing", retrospectiveId, section.id);

    setNewPost((prev) => ({ ...prev, content: e.target.value }));

    if (e.target.value === "") {
      socket.emit("stop-writing", retrospectiveId, section.id);
      return;
    }
  };

  const handleSavePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("stop-writing", retrospectiveId, section.id);
    setIsLoadingPosts(true);

    try {
      await createPost({ sectionId: section.id, newPost });
      socket.emit("posts", retrospectiveId, newPost);
      setNewPost(defaultPostState);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleDestroyPost = async (postId: string) => {
    setIsLoadingPosts(true);
    await destroyPost({ postId });
    socket.emit("delete-post", retrospectiveId, section.id, postId);
    setIsLoadingPosts(false);
  };

  const handleChangeSectionTitle = async (formData: FormData) => {
    addOptimisticTitle(newSectionTitle);

    await editRetroSectionTitle({
      title: newSectionTitle,
      sectionId: section.id,
    });

    setIsEditingSectionTitle(false);
  };

  const handlePostVoting = async (postId: string, hasVoted: boolean) => {
    if (userSession.id) {
      if (hasVoted) {
        await removeVoteFromPost(postId, userSession.id);
      } else {
        await addVoteToPost(postId, userSession.id);
      }
    }
  };

  const sortedPostsByVotes = section.posts.sort(
    (a, b) => b.votes.length - a.votes.length,
  );

  return (
    <div>
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

                return (
                  <Card key={post.id} className="mx-2 my-2 group">
                    <div className="p-2 text-sm flex justify-between items-center gap-2">
                      <p>{post.content}</p>

                      <div className="flex gap-2 items-center">
                        <div className="text-xs mt-px">
                          {post.votes.length !== 0 && `+${post.votes.length}`}
                        </div>
                        {userSession.id !== post.userId && (
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
                        {userSession.id === post.userId && (
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
          onSubmit={handleSavePost}
          className="mx-2 mt-10 flex flex-col justify-end"
        >
          <Input
            disabled={isLoadingPosts}
            className="p-2 text-sm"
            value={newPost.content}
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
