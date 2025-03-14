import { GoogleGenerativeAI } from '@google/generative-ai';
import { DateTime } from 'luxon';
import { NextResponse } from 'next/server';

import { RetrospectiveData } from '@/types/Retro';
import { decryptMessage } from '@/app/cryptoClient';

const geminiCache = new Map<string, string>();

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

function checkGeminiCache(cacheKey: string) {
  if (geminiCache.has(cacheKey)) {
    return NextResponse.json({
      summary: geminiCache.get(cacheKey),
      cached: true
    });
  }
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
    date: DateTime.fromISO(date).toFormat('MM/dd/yyyy'),
    sections: decryptedPostsSections,
    participants
  };
}

export async function POST(request: Request) {
  try {
    const { data, participants } = (await request.json()) as RequestObject;

    const cacheKey = data.id;
    checkGeminiCache(cacheKey);

    const geminiAPIKey = process.env.GEMINI_API_KEY;
    if (!geminiAPIKey) {
      throw new Error('Missing GEMINI_API_KEY');
    }

    const genAI = new GoogleGenerativeAI(geminiAPIKey);

    const symmetricKey = request.headers.get('x-encrypted-key');

    const formattedBody = formatBodyForSummary({
      data,
      participants,
      symmetricKey
    });

    const generationConfig = {
      temperature: 0.9,
      responseMimeType: 'text/plain'
    };

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: 'casual tone, natural output in a well formatted text',
      generationConfig
    });

    const prompt = `Generate a structured summary in Markdown format for the following information:

* **Retrospective Meeting:** - use h2 font size
    * *Host*: [adminName] - use normal text size
    * *Date*: [date] - use normal text size
    * *Participants*: [participants] - use normal text size
    *
        * [sectionName - use h2]: (only include section name)
        * [use list format - Make a summary of the section - don't use summary word - give importance to the most relevant information and format it to a clear and concise summary]
        * [sectionName - use h2]: (only include section name)
        * [use list format - Make a summary of the section - don't use summary word - give importance to the most relevant information and format it to a clear and concise summary]
        * (repeat with the rest of the sections)

**Markdown format:**

* Use headings (H2, H3, H4) for titles and subtitles.
* Use bold to emphatize the important parts, inside the sections.
* Use bold for Host, Date and Participants tags

**Important**:
* Make sure the summary is clear and concise.
* Avoid including personal information or sensitive data.
* Make sure the summary is well formatted and easy to read.
* Organize and give importance to the most relevant information, taking in account the number of votes but do not include the number of votes in the summary.
* Do not include users ids or personal information in the summary.

SummaryJSON:
${JSON.stringify(formattedBody)}
`;

    const finalResponse = await model.generateContent(prompt);

    const finalData = finalResponse.response;
    const finalSummary = finalData.text();

    // Cache result
    geminiCache.set(cacheKey, finalSummary);

    return NextResponse.json({
      summary: finalSummary,
      cached: false
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'An error ocurred proccessing the summary with Gemini, please try again later' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
