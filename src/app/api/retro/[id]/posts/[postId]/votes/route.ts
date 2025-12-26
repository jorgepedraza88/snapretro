import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
    postId: string;
  };
}

async function getPostVotes(postId: string) {
  const post = await prisma.retrospectivePost.findUnique({
    where: { id: postId },
    select: { votes: true }
  });

  if (!post) {
    throw new Error('Post not found');
  }

  return post.votes;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { postId } = params;

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    await prisma.retrospectivePost.update({
      where: { id: postId },
      data: {
        votes: {
          push: userId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding vote:', error);
    return NextResponse.json({ error: 'Failed to add vote' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { postId } = params;

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const votes = await getPostVotes(postId);
    const updatedVotes = votes.filter((vote) => vote !== userId);

    await prisma.retrospectivePost.update({
      where: { id: postId },
      data: {
        votes: updatedVotes
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing vote:', error);
    return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
  }
}
