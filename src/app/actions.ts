'use server';

import { revalidatePath } from 'next/cache';

import { RetrospectiveData } from '@/types/Retro';
import { prisma } from '@/lib/prisma';
import { generateDefaultSections } from './utils';

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
  revalidatePath('/retro/[id]', 'page');
}

export async function getRetrospetiveData(
  retrospectiveId: string
) {
  try {
    const retrospective = await prisma.retrospective.findUnique({
      where: { id: retrospectiveId },
      include: {
        sections: {
          include: {
            posts: true // Include nested posts for each section
          },
          orderBy: { sort_order: 'asc' } // Explicitly order sections by sort order
        }
      }
    });

    return retrospective;
  } catch (error) {
    console.log(error);
    throw new Error('Error getting retrospective data');
  }
}

export async function createPost({ sectionId, newPost }: CreatePostParams) {
  const { userId, content, votes } = newPost;

  try {
    await prisma.retrospectiveSection.update({
      where: { id: sectionId },
      data: {
        posts: {
          create: {
            userId,
            content,
            votes
          }
        }
      }
    });

    revalidatePath('/retro/[id]', 'page');
  } catch (error) {
    throw new Error(`Error creating post, ${error}`);
  }
}

export async function destroyPost({ postId }: DestroyPostParams) {
  try {
    await prisma.retrospectivePost.delete({
      where: { id: postId }
    });

    revalidatePath('/retro/[id]', 'page');
  } catch (error) {
    console.log(error);
    throw new Error('Error deleting post');
  }
}

export async function createRetro(data: CreateRetrospectiveData) {
  const { sectionsNumber, ...restData } = data;

  try {
    const retrospective = await prisma.retrospective.create({
      data: {
        ...restData,
        status: 'active',
        sections: {
          create: generateDefaultSections(sectionsNumber)
        }
      },
      include: { sections: { include: { posts: true } } }
    });

    return retrospective;
  } catch (error) {
    console.log(error);
    throw new Error(`Failed to create retrospective, ${error}`);
  }
}

export async function editRetroSectionTitle(data: { sectionId: string; title: string }) {
  const { sectionId, title } = data;

  try {
    await prisma.retrospectiveSection.update({
      where: { id: sectionId },
      data: { title }
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to edit section title');
  }

  revalidatePath('/retro/[id]', 'page');
}

export async function editRetroAdminId(data: { retrospectiveId: string; newAdminId: string }) {
  const { retrospectiveId, newAdminId } = data;

  try {
    await prisma.retrospective.update({
      where: { id: retrospectiveId },
      data: { adminId: newAdminId }
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to edit newAdminId');
  }

  revalidatePath('/retro/[id]', 'page');
}

export async function editRetroSectionsNumber(retrospectiveId: string, newNumber: number) {
  try {
    const sections = await prisma.retrospectiveSection.findMany({
      where: { retrospectiveId },
      orderBy: { sortOrder: 'asc' }
    });

    const currentNumber = sections.length;

    if (newNumber > currentNumber) {
      const newSections = generateDefaultSections(newNumber - currentNumber);

      await prisma.retrospective.update({
        where: { id: retrospectiveId },
        data: {
          sections: {
            create: newSections
          }
        }
      });
    } else if (newNumber < currentNumber) {
      const sectionsToRemove = sections.slice(newNumber);

      await prisma.$transaction(
        sectionsToRemove.map((section) =>
          prisma.retrospectiveSection.delete({
            where: { id: section.id }
          })
        )
      );
    }
  } catch (error) {
    console.log(error);
    throw new Error('Failed to edit sections number');
  }

  revalidatePath('/retro/[id]', 'page');
}

export async function editRetroSettings(
  retrospectiveId: string,
  newSettings: { allowVotes: boolean; allowMessages: boolean }
) {
  try {
    await prisma.retrospective.update({
      where: { id: retrospectiveId },
      data: newSettings
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to edit settings');
  }

  revalidatePath('/retro/[id]', 'page');
}

export async function editRetroPassword(retrospectiveId: string, newPassword: string) {
  try {
    await prisma.retrospective.update({
      where: { id: retrospectiveId },
      data: {
        password: newPassword,
        enablePassword: newPassword ? true : false
      }
    });
  } catch (error) {
    console.log(error);
    throw new Error('Failed to edit password');
  }

  revalidatePath('/retro/[id]', 'page');
}

async function getPostVotes(postId: string) {
  const post = await prisma.retrospectivePost.findUnique({
    where: { id: postId },
    select: { votes: true }
  });

  if (!post) {
    if (!post) throw new Error('Post not found');
  }

  return post.votes;
}

export async function addVoteToPost(postId: string, userId: string) {
  try {
    await prisma.retrospectivePost.update({
      where: { id: postId },
      data: {
        votes: {
          push: userId
        }
      }
    });
  } catch (error) {
    console.log(error);
    throw new Error('Error adding vote to post');
  }

  revalidatePath('/retro/[id]', 'page');
}

export async function removeVoteFromPost(postId: string, userId: string) {
  try {
    const votes = await getPostVotes(postId);

    const updatedVotes = votes.filter((vote) => vote !== userId);

    await prisma.retrospectivePost.update({
      where: { id: postId },
      data: {
        votes: updatedVotes
      }
    });
  } catch (error) {
    console.log(error);
    throw new Error('Error removing vote from post');
  }

  revalidatePath('/retro/[id]', 'page');
}

export async function endRetrospective(retrospectiveId: string) {
  try {
    const retrospective = await prisma.retrospective.update({
      where: { id: retrospectiveId },
      data: { status: 'ended' },
      include: {
        sections: {
          include: {
            posts: true // Include nested posts for each section
          },
          orderBy: { sortOrder: 'asc' } // Explicitly order sections by sortOrder
        }
      }
    });

    revalidatePath('/retro/[id]', 'page');

    return retrospective;
  } catch (error) {
    console.log(error);
    throw new Error('Error ending retrospective');
  }
}
