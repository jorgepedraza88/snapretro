"use server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import { RetrospectiveSection } from "@/components/retro-card-group";

interface CreatePostParams {
  section: RetrospectiveSection;
  content: string;
}

export async function createPost({ section, content }: CreatePostParams) {
  const newPosts = [...section.posts, { id: nanoid(5), content }];

  const response = await fetch(
    `http://localhost:3005/retrospective/${section.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        posts: newPosts,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Error creating post");
  }

  revalidatePath("/retro/[id]", "page");
}

export async function destroyPost({
  section,
  postId,
}: {
  section: RetrospectiveSection;
  postId: string;
}) {
  const newPosts = section.posts.filter((post) => post.id !== postId);

  const response = await fetch(
    `http://localhost:3005/retrospective/${section.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        posts: newPosts,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Error deleting post");
  }

  revalidatePath("/retro/[id]", "page");
}
