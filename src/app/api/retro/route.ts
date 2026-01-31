import { NextRequest, NextResponse } from 'next/server';

import { generateDefaultSections } from '@/app/utils';
import { prisma } from '@/lib/prisma';

interface CreateRetroRequestBody {
  name: string;
  adminId: string;
  avatarUrl?: string;
  timer: number;
  enableChat: boolean;
  enablePassword: boolean;
  password?: string;
  sectionsNumber: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateRetroRequestBody = await request.json();
    const {
      name,
      adminId,
      avatarUrl,
      timer,
      enableChat,
      enablePassword,
      password,
      sectionsNumber
    } = body;

    const settings = {
      avatarUrl,
      timer,
      enableChat,
      enablePassword,
      allowVotes: true,
      allowMessages: true
    };

    const retrospective = await prisma.retrospective.create({
      data: {
        name,
        admin_id: adminId,
        secret_word: password,
        status: 'active',
        settings,
        sections: {
          create: generateDefaultSections(sectionsNumber).map((section) => ({
            name: section.name,
            sort_order: section.sort_order
          }))
        }
      },
      include: {
        sections: {
          include: {
            posts: true
          }
        }
      }
    });

    return NextResponse.json(retrospective, { status: 201 });
  } catch (error) {
    console.error('Error creating retrospective:', error);
    return NextResponse.json({ error: 'Failed to create retrospective' }, { status: 500 });
  }
}
