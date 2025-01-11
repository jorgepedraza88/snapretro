"use server";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { generateDefaultSections } from "./utils";
import { DateTime } from "luxon";

import { prisma } from "@/lib/prisma";

interface CreatePostParams {
  sectionId: string;
  newPost: {
    userId: string;
    content: string;
    votes: string[];
  };
}

interface DestroyPostParams {
  postId: string;
}

export interface CreateRetrospectiveData {
  adminId: string;
  avatarUrl: string;
  adminName: string;
  timer: 300;
  allowVotes: boolean;
  enableChat: boolean;
  enablePassword: boolean;
  password: string | null;
  sectionsNumber: number;
}

export async function revalidate() {
  revalidatePath("/retro/[id]", "page");
}

export async function createPost({ sectionId, newPost }: CreatePostParams) {
  const { userId, content, votes } = newPost;

  try {
    await prisma.retrospectiveSection.update({
      where: { id: sectionId },
      data: {
        posts: {
          create: {
            id: nanoid(),
            userId,
            content,
            votes,
          },
        },
      },
    });

    revalidatePath("/retro/[id]", "page");
  } catch (error) {
    throw new Error(`Error creating post, ${error}`);
  }
}

export async function destroyPost({ postId }: DestroyPostParams) {
  try {
    await prisma.retrospectivePost.delete({
      where: { id: postId },
    });

    revalidatePath("/retro/[id]", "page");
  } catch (error) {
    console.log(error);
    throw new Error("Error deleting post");
  }
}

export async function createRetro(data: CreateRetrospectiveData) {
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
      include: { sections: { include: { posts: true } } },
    });

    return retrospective;
  } catch (error) {
    throw new Error(`Failed to create retrospective, ${error}`);
  }
}

export async function editRetroSectionTitle(data: {
  sectionId: string;
  title: string;
}) {
  const { sectionId, title } = data;
  try {
    await prisma.retrospectiveSection.update({
      where: { id: sectionId },
      data: { title },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to edit section title");
  }

  revalidatePath("/retro/[id]", "page");
}

export async function editRetroAdminId(data: {
  retrospectiveId: string;
  adminId: string;
}) {
  const { retrospectiveId, adminId } = data;

  try {
    await prisma.retrospective.update({
      where: { id: retrospectiveId },
      data: { adminId },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to edit adminId");
  }

  revalidatePath("/retro/[id]", "page");
}

async function getPostVotes(postId: string) {
  const post = await prisma.retrospectivePost.findUnique({
    where: { id: postId },
    select: { votes: true },
  });

  if (!post) {
    if (!post) throw new Error("Post not found");
  }

  return post.votes;
}

export async function addVoteToPost(postId: string, userId: string) {
  try {
    await prisma.retrospectivePost.update({
      where: { id: postId },
      data: {
        votes: {
          push: userId,
        },
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error adding vote to post");
  }

  revalidatePath("/retro/[id]", "page");
}

export async function removeVoteFromPost(postId: string, userId: string) {
  try {
    const votes = await getPostVotes(postId);

    const updatedVotes = votes.filter((vote) => vote !== userId);

    await prisma.retrospectivePost.update({
      where: { id: postId },
      data: {
        votes: updatedVotes,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error removing vote from post");
  }

  revalidatePath("/retro/[id]", "page");
}
