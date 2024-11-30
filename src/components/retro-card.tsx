"use client";
import { useState } from "react";
import { RetrospectiveSection } from "./retro-card-group";
import { Card, CardTitle, CardDescription } from "./ui/card";
import {
  HiOutlineChatBubbleOvalLeftEllipsis as WritingIcon,
  HiXMark as RemoveIcon,
} from "react-icons/hi2";

import { createPost, destroyPost } from "@/app/actions";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface RetroCardProps {
  title: string;
  description?: string;
  section: RetrospectiveSection;
  isWriting?: boolean;
}

export function RetroCard({
  title,
  description,
  section,
  isWriting,
}: RetroCardProps) {
  const [newPost, setNewPost] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleNewPostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPost(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createPost({ section, content: newPost });
      setNewPost("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestroyPost = async (postId: string) => {
    setIsLoading(true);
    try {
      await destroyPost({ section, postId });
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-40">
      <Card className="w-72 h-full flex flex-col justify-between bg-gray-100">
        <div className="p-4 bg-gray-200 rounded-t-lg mb-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="h-full">
          {section.posts.length > 0 ? (
            section.posts.map((post) => (
              <Card key={post.id} className="mx-2 my-2">
                <div className="p-2 text-sm flex justify-between items-center gap-2">
                  {post.content}
                  <Button
                    variant="ghost"
                    className="p-1.5 h-auto"
                    onClick={() => handleDestroyPost(post.id)}
                  >
                    <RemoveIcon className="shrink-0" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-400">Write anything</div>
          )}
        </div>
        <div className="mx-2 pt-10 pb-4">
          <form onSubmit={handleSubmit}>
            <Input
              disabled={isLoading}
              className="p-2 text-sm"
              value={newPost}
              onChange={handleNewPostChange}
            />
          </form>
        </div>
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
