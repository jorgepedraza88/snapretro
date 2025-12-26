import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
    postId: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { postId } = params;

  try {
    await prisma.retrospectivePost.delete({
      where: { id: postId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
