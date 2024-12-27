"use client";
import { useEffect, useState } from "react";
import { Card, CardTitle, CardDescription } from "./ui/card";
import {
  HiOutlineChatBubbleOvalLeftEllipsis as WritingIcon,
  HiTrash as RemoveIcon,
} from "react-icons/hi2";
import { socket } from "@/socket";

import { createPost, destroyPost, revalidate } from "@/app/postActions";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { RetrospectiveSection } from "@/types/Retro";
import { useParams } from "next/navigation";
import { useUserSession } from "@/hooks/user-session-context";

interface RetroCardProps {
  title: string;
  description?: string;
  section: RetrospectiveSection;
}

interface NewPost {
  content: string;
  userId: string;
}

export function RetroCard({ title, description, section }: RetroCardProps) {
  const { userSession } = useUserSession();
  const params = useParams<{ id: string }>();
  const retrospectiveId = params.id;

  const defaultPostState = { userId: userSession?.id || "", content: "" };

  const [newPost, setNewPost] = useState<NewPost>(defaultPostState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWriting, setIsWriting] = useState<boolean>(false);

  useEffect(() => {
    socket.on("posts", () => {
      revalidate();
    });

    socket.on("writing", (id: string) => {
      if (section.id === id) {
        setIsWriting(true);
      }
    });

    socket.on("stop-writing", (id: string) => {
      if (section.id === id) {
        setIsWriting(false);
      }
    });

    socket.on("delete-post", async (sectionId, postId) => {
      if (section.id === sectionId) {
        await destroyPost({ section, postId, retrospectiveId });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewPostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    socket.emit("writing", section.id);

    setNewPost((prev) => ({ ...prev, content: e.target.value }));

    if (e.target.value === "") {
      socket.emit("stop-writing", section.id);
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("stop-writing", section.id);
    setIsLoading(true);

    if (!newPost.userId) {
      console.error("User not found");
      setIsLoading(false);
      return;
    }

    try {
      await createPost({ section, newPost, retrospectiveId });
      socket.emit("posts", newPost);
      setNewPost(defaultPostState);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestroyPost = async (postId: string) => {
    setIsLoading(true);
    try {
      await destroyPost({ section, postId, retrospectiveId });
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      socket.emit("delete-post", section.id, postId);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card className="bg-gray-100 flex flex-col justify-between h-full pb-4">
        <div>
          <div className="p-4 bg-gray-200 rounded-t-lg mb-2">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div>
            {section.posts.length > 0 ? (
              section.posts.map((post) => (
                <Card key={post.id} className="mx-2 my-2 group">
                  <div className="p-2 text-sm flex justify-between items-center gap-2">
                    <p>{post.content}</p>
                    {userSession?.id === post.userId && (
                      <Button
                        variant="ghost"
                        className="p-1.5 h-auto invisible group-hover:visible"
                        onClick={() => handleDestroyPost(post.id)}
                      >
                        <RemoveIcon className="shrink-0" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-400">Write anything</div>
            )}
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mx-2 mt-10 flex flex-col justify-end"
        >
          <Input
            disabled={isLoading}
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
