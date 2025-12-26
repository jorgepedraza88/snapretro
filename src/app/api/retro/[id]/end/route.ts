import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const retrospective = await prisma.retrospective.update({
      where: { id },
      data: {
        status: 'ended',
        end_date: new Date()
      },
      include: {
        sections: {
          include: {
            posts: true
          },
          orderBy: { sort_order: 'asc' }
        }
      }
    });

    return NextResponse.json(retrospective);
  } catch (error) {
    console.error('Error ending retrospective:', error);
    return NextResponse.json({ error: 'Failed to end retrospective' }, { status: 500 });
  }
}
