"use server";
import { RetrospectiveSection } from "@/types/Retro";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

interface CreatePostParams {
  section: RetrospectiveSection;
  content: string;
  retrospectiveId: string;
}

interface DestroyPostParams {
  section: RetrospectiveSection;
  postId: string;
  retrospectiveId: string;
}

// TODO: Improve with better database

export async function createPost({
  section,
  content,
  retrospectiveId,
}: CreatePostParams) {
  // Obtain the retrospective
  const response = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
  );

  if (!response.ok) {
    throw new Error("Error fetching retrospective");
  }

  const retrospective = await response.json();

  // Update the specific section
  const updatedSections = retrospective.sections.map(
    (sect: RetrospectiveSection) =>
      sect.id === section.id
        ? { ...sect, posts: [...sect.posts, { id: nanoid(5), content }] } // Añadir el nuevo post
        : sect,
  );

  const res = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sections: updatedSections,
      }),
    },
  );

  if (!res.ok) {
    throw new Error("Error creating post");
  }

  revalidatePath("/retro/[id]", "page");
}

export async function destroyPost({
  section,
  postId,
  retrospectiveId,
}: DestroyPostParams) {
  // Obtain the retrospective
  const response = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
  );

  if (!response.ok) {
    throw new Error("Error fetching retrospective");
  }

  const retrospective = await response.json();

  // Filter the post you want to delete
  const updatedSections = retrospective.sections.map(
    (sect: RetrospectiveSection) =>
      sect.id === section.id
        ? { ...sect, posts: sect.posts.filter((post) => post.id !== postId) }
        : sect,
  );

  const res = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sections: updatedSections,
      }),
    },
  );

  if (!res.ok) {
    throw new Error("Error deleting post");
  }

  revalidatePath("/retro/[id]", "page");
}
