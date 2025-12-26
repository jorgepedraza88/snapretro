import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing retrospective id' }, { status: 400 });
    }

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

    return NextResponse.json(retrospective);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      return NextResponse.json(
        { error: 'An error ocurred proccessing the retrospective data, please try again later' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
