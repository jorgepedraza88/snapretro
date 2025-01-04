"use server";
import { RetrospectiveSection } from "@/types/Retro";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { generateDefaultSections } from "./utils";
import { DateTime } from "luxon";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreatePostParams {
  section: RetrospectiveSection;
  newPost: {
    userId: string;
    content: string;
    votes: string[];
  };
  retrospectiveId: string;
}

interface DestroyPostParams {
  section: RetrospectiveSection;
  postId: string;
  retrospectiveId: string;
}

export interface CreateRetroSpectiveData {
  id: string;
  adminId: string;
  avatarUrl: string;
  adminName: string;
  date: string;
  timer: 300;
  allowVotes: boolean;
  enableChat: boolean;
  enablePassword: boolean;
  password: string | null;
  sectionsNumber: number;
  participants: Participant[];
}

export type Participant = {
  id: string;
  username: string;
  isAdmin: boolean;
};

export async function createPost({
  section,
  newPost,
  retrospectiveId,
}: CreatePostParams) {
  const { userId, content, votes } = newPost;

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
        ? {
            ...sect,
            posts: [...sect.posts, { id: nanoid(5), userId, content, votes }],
          }
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

export async function revalidate() {
  revalidatePath("/retro/[id]", "page");
}

export async function destroyPost({
  section,
  postId,
  retrospectiveId,
}: DestroyPostParams) {
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

export async function createRetro(data: CreateRetroSpectiveData) {
  const { sectionsNumber, ...restData } = data;

  try {
    const retrospective = await prisma.retrospective.create({
      data: {
        ...restData,
        date: DateTime.now().toISO(),
        sections: {
          create: generateDefaultSections(sectionsNumber),
        },
      },
      include: { sections: { include: { posts: true } } }, // Include nested sections and posts
    });

    return retrospective; // Return the created retrospective
  } catch (error) {
    console.error("Error creating retrospective:", error);
    throw new Error("Error creating retrospective");
  }
}

export async function editRetroSectionTitle(data: {
  retrospectiveId: string;
  sectionId: string;
  title: string;
}) {
  const { sectionId, title } = data;

  try {
    // Update the section title directly in the database
    await prisma.retrospectiveSection.update({
      where: { id: sectionId },
      data: { title },
    });

    // Optionally revalidate the page to reflect changes
    revalidatePath("/retro/[id]", "page");
  } catch (error) {
    console.error("Error editing section title:", error);
    throw new Error("Failed to edit section title");
  }
}

export async function editRetroAdminId(data: {
  retrospectiveId: string;
  adminId: string;
}) {
  const { retrospectiveId, adminId } = data;

  const res = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminId,
      }),
    },
  );
  const response = await res.json();

  revalidatePath("/retro/[id]", "page");
}

export async function handleVotePost({
  sectionId,
  postId,
  retrospectiveId,
  userId,
  hasVoted,
}: {
  sectionId: string;
  postId: string;
  retrospectiveId: string;
  userId: string;
  hasVoted: boolean;
}) {
  const response = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
  );

  if (!response.ok) {
    throw new Error("Error fetching retrospective");
  }

  const retrospective = await response.json();

  let updatedSections;

  if (hasVoted) {
    updatedSections = retrospective.sections.map(
      (sect: RetrospectiveSection) =>
        sect.id === sectionId
          ? {
              ...sect,
              posts: sect.posts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      votes: post.votes.filter((vote) => vote !== userId),
                    }
                  : post,
              ),
            }
          : sect,
    );
  } else {
    updatedSections = retrospective.sections.map(
      (sect: RetrospectiveSection) =>
        sect.id === sectionId
          ? {
              ...sect,
              posts: sect.posts.map((post) =>
                post.id === postId
                  ? { ...post, votes: [...post.votes, userId] }
                  : post,
              ),
            }
          : sect,
    );
  }

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
    throw new Error("Error voting post");
  }

  revalidatePath("/retro/[id]", "page");
}
