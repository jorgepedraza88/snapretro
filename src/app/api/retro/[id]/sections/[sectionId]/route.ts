import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string; // retrospectiveId
    sectionId: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { sectionId } = params;

  try {
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const updatedSection = await prisma.retrospectiveSection.update({
      where: { id: sectionId },
      data: { title }
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('Error updating section title:', error);
    return NextResponse.json({ error: 'Failed to update section title' }, { status: 500 });
  }
}
