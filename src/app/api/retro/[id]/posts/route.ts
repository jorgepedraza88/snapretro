import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string; // retrospectiveId
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const body = await request.json();
    const { sectionId, userId, content, votes } = body;

    // Validate request body
    if (!sectionId || !userId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const post = await prisma.retrospectivePost.create({
      data: {
        section_id: sectionId,
        user_id: userId,
        content,
        votes: votes || []
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
