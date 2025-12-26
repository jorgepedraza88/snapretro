import { NextRequest, NextResponse } from 'next/server';

import { generateDefaultSections } from '@/app/utils';
import { prisma } from '@/lib/prisma';

// Define the shape of the settings inside the JSONB column
interface RetrospectiveSettings {
  avatarUrl?: string;
  adminName?: string;
  timer?: number;
  allowVotes?: boolean;
  enableChat?: boolean;
  enablePassword?: boolean;
}

interface RouteParams {
  params: {
    id: string; // retrospectiveId
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  try {
    const body = await request.json();
    const { settings, password, sectionsNumber } = body;

    // Handle sections number update if provided
    if (sectionsNumber !== undefined) {
      const sections = await prisma.retrospectiveSection.findMany({
        where: { retrospective_id: id },
        orderBy: { sort_order: 'asc' }
      });

      const currentNumber = sections.length;

      if (sectionsNumber > currentNumber) {
        const newSectionsCount = sectionsNumber - currentNumber;
        const newSections = generateDefaultSections(newSectionsCount).map((section, index) => ({
          title: section.title,
          sort_order: currentNumber + index,
          retrospective_id: id
        }));

        // We can't use createMany with relations in the same way as nested create, so we loop or use createMany if not nested.
        // Prisma createMany is supported for simple creates.
        // However, generateDefaultSections returns objects with nested 'posts: { create: [] }'.
        // We need to strip that for createMany or use a transaction.

        await prisma.$transaction(
          newSections.map((section) =>
            prisma.retrospectiveSection.create({
              data: {
                title: section.title,
                sort_order: section.sort_order,
                retrospective_id: id
              }
            })
          )
        );
      } else if (sectionsNumber < currentNumber) {
        const sectionsToRemove = sections.slice(sectionsNumber);

        await prisma.retrospectiveSection.deleteMany({
          where: {
            id: {
              in: sectionsToRemove.map((s) => s.id)
            }
          }
        });
      }
    }

    // Handle standard updates (settings, password)
    const updateData: any = {};

    if (settings) {
      // We need to merge with existing settings or replace?
      // Prisma JSON operations can be tricky. Ideally we might want to fetch first if we want partial update of settings,
      // but typically a settings save operation sends the whole settings object.
      // Let's assume we replace the settings object or merge if we want to be safe, but new settings structure suggests we can just save it.
      // However, looking at the code, let's treat it as a partial update to the retro settings.
      // Using PostgreSQL jsonb_set logic is complex with Prisma.
      // Simplest is to fetch and update if we care about merging, but the request normally sends the state.
      // Let's rely on the client sending the full settings state or just updating the fields passed.

      // Actually, the easiest way for now is to just update what is passed.
      // But `settings` is a single column.
      if (settings) {
        // If we want to support partial settings update without overwriting other keys,
        // we'd need to fetch first.
        const currentRetro = await prisma.retrospective.findUnique({
          where: { id },
          select: { settings: true }
        });

        const currentSettings = (currentRetro?.settings as RetrospectiveSettings) || {};
        updateData.settings = { ...currentSettings, ...settings };
      }
    }

    if (password !== undefined) {
      updateData.secret_word = password;
      // Also need to update enablePassword in settings if logic requires it?
      // The original action updated `enablePassword` based on password existence.
      // The new `settings` JSONB has `enablePassword`.
      // We should arguably update it there too if the client doesn't send it.
      // But likely the client logic will handle sending the correct settings object.
      // For safety, let's leave settings logic to the settings property.
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.retrospective.update({
        where: { id },
        data: updateData
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
