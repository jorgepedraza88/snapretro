import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const retrospective = await prisma.retrospective.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            posts: true
          },
          orderBy: { sort_order: 'asc' }
        }
      }
    });

    if (!retrospective) {
      return NextResponse.json({ error: 'Retrospective not found' }, { status: 404 });
    }

    return NextResponse.json(retrospective);
  } catch (error) {
    console.error('Error fetching retrospective:', error);
    return NextResponse.json(
      { error: 'An error occurred fetching the retrospective' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const body = await request.json();
    const { adminId } = body;

    // Currently only supporting adminId update here as per plan
    if (!adminId) {
      return NextResponse.json({ error: 'Missing adminId' }, { status: 400 });
    }

    const updatedRetrospective = await prisma.retrospective.update({
      where: { id },
      data: { admin_id: adminId }
    });

    return NextResponse.json(updatedRetrospective);
  } catch (error) {
    console.error('Error updating retrospective:', error);
    return NextResponse.json({ error: 'Failed to update retrospective' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    await prisma.retrospective.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting retrospective:', error);
    return NextResponse.json({ error: 'Failed to delete retrospective' }, { status: 500 });
  }
}
