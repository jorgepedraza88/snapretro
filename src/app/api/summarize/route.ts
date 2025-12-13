import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { DateTime } from 'luxon';
import { NextResponse } from 'next/server';

import { RetrospectiveData } from '@/types/Retro';
import { decryptMessage } from '@/app/cryptoClient';

interface RequestObject {
  data: RetrospectiveData;
  participants: string[];
  symmetricKey: string;
}

interface FormatBodyForSummaryParams {
  data: RetrospectiveData;
  participants: string[];
  symmetricKey: string | null;
}

function formatBodyForSummary({ data, participants, symmetricKey }: FormatBodyForSummaryParams) {
  if (!symmetricKey) {
    return NextResponse.json({ error: 'Missing encryption key' }, { status: 400 });
  }

  const { sections, adminName, date } = data;

  const decryptedPostsSections = sections.map((section) => {
    const newPosts = section.posts.map((post) => {
      const decryptedPostContent = decryptMessage(post.content, symmetricKey);
      return { ...post, content: decryptedPostContent };
    });
    return { ...section, posts: newPosts };
  });

  return {
    adminName: adminName,
    date: DateTime.fromJSDate(new Date(date)).toFormat('MM/dd/yyyy'),
    sections: decryptedPostsSections,
    participants
  };
}

export async function POST(request: Request) {
  try {
    const { data, participants } = (await request.json()) as RequestObject;

    const symmetricKey = request.headers.get('x-encrypted-key');

    const formattedBody = formatBodyForSummary({
      data,
      participants,
      symmetricKey
    });

    const systemPrompt = `You are a retrospective meeting summarizer. Your task is to generate clear, concise summaries in Markdown format with a casual, natural tone.

**Output Structure:**

The summary must follow this exact structure:
1. **Retrospective Meeting:** (H2 heading)
   - **Host**: [adminName]
   - **Date**: [date]
   - **Participants**: [comma-separated list of participants]

2. For each section in the data:
   - **[Section Name]** (H2 heading)
   - Bullet list summarizing the section content
   - Emphasize the most important points with **bold**
   - Organize information by relevance

**Formatting Rules:**

* Use H2 headings (##) for "Retrospective Meeting" and each section name
* Use bold (**text**) for emphasis on important information
* Use bold for labels: Host, Date, and Participants
* Keep the tone casual and natural
* Make the summary clear, concise, and easy to read

**Content Guidelines:**

* Prioritize the most relevant information based on the number of votes
* DO NOT mention vote counts in the summary
* DO NOT include user IDs or any personal identifiable information
* DO NOT include sensitive data
* DO NOT use the word "summary" in the content
* Focus on the actual content and insights, not metadata`;

    const { text: finalSummary } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      system: systemPrompt,
      prompt: `Generate a structured summary for the following retrospective meeting data:\n\n${JSON.stringify(formattedBody, null, 2)}`,
      temperature: 0.7
    });

    return NextResponse.json({
      summary: finalSummary
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      return NextResponse.json(
        { error: 'An error ocurred proccessing the summary with Gemini, please try again later' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
