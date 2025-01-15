"use server";

import { revalidatePath } from "next/cache";
import { decryptMessage, generateDefaultSections } from "./utils";
import { DateTime } from "luxon";

import { prisma } from "@/lib/prisma";
import { RetrospectiveData } from "@/types/Retro";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface CreatePostParams {
  sectionId: string;
  newPost: {
    userId: string;
    content: string;
    votes: string[];
  };
}

interface DestroyPostParams {
  postId: string;
}

export interface CreateRetrospectiveData {
  adminId: string;
  avatarUrl: string;
  adminName: string;
  timer: 300;
  allowVotes: boolean;
  enableChat: boolean;
  enablePassword: boolean;
  password: string | null;
  sectionsNumber: number;
}

export async function revalidate() {
  revalidatePath("/retro/[id]", "page");
}

export async function getRetrospetiveData(retrospectiveId: string) {
  const retrospective = await prisma.retrospective.findUnique({
    where: { id: retrospectiveId },
    include: {
      sections: {
        include: {
          posts: true, // Include nested posts for each section
        },
        orderBy: { sortOrder: "asc" }, // Explicitly order sections by sortOrder
      },
    },
  });

  return retrospective;
}

export async function createPost({ sectionId, newPost }: CreatePostParams) {
  const { userId, content, votes } = newPost;

  try {
    await prisma.retrospectiveSection.update({
      where: { id: sectionId },
      data: {
        posts: {
          create: {
            userId,
            content,
            votes,
          },
        },
      },
    });

    revalidatePath("/retro/[id]", "page");
  } catch (error) {
    throw new Error(`Error creating post, ${error}`);
  }
}

export async function destroyPost({ postId }: DestroyPostParams) {
  try {
    await prisma.retrospectivePost.delete({
      where: { id: postId },
    });

    revalidatePath("/retro/[id]", "page");
  } catch (error) {
    console.log(error);
    throw new Error("Error deleting post");
  }
}

export async function createRetro(data: CreateRetrospectiveData) {
  const { sectionsNumber, ...restData } = data;

  try {
    const retrospective = await prisma.retrospective.create({
      data: {
        ...restData,
        status: "active",
        date: DateTime.now().toISO(),
        sections: {
          create: generateDefaultSections(sectionsNumber),
        },
      },
      include: { sections: { include: { posts: true } } },
    });

    return retrospective;
  } catch (error) {
    throw new Error(`Failed to create retrospective, ${error}`);
  }
}

export async function editRetroSectionTitle(data: {
  sectionId: string;
  title: string;
}) {
  const { sectionId, title } = data;
  try {
    await prisma.retrospectiveSection.update({
      where: { id: sectionId },
      data: { title },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to edit section title");
  }

  revalidatePath("/retro/[id]", "page");
}

export async function editRetroAdminId(data: {
  retrospectiveId: string;
  adminId: string;
}) {
  const { retrospectiveId, adminId } = data;

  try {
    await prisma.retrospective.update({
      where: { id: retrospectiveId },
      data: { adminId },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to edit adminId");
  }

  revalidatePath("/retro/[id]", "page");
}

async function getPostVotes(postId: string) {
  const post = await prisma.retrospectivePost.findUnique({
    where: { id: postId },
    select: { votes: true },
  });

  if (!post) {
    if (!post) throw new Error("Post not found");
  }

  return post.votes;
}

export async function addVoteToPost(postId: string, userId: string) {
  try {
    await prisma.retrospectivePost.update({
      where: { id: postId },
      data: {
        votes: {
          push: userId,
        },
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error adding vote to post");
  }

  revalidatePath("/retro/[id]", "page");
}

export async function removeVoteFromPost(postId: string, userId: string) {
  try {
    const votes = await getPostVotes(postId);

    const updatedVotes = votes.filter((vote) => vote !== userId);

    await prisma.retrospectivePost.update({
      where: { id: postId },
      data: {
        votes: updatedVotes,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error removing vote from post");
  }

  revalidatePath("/retro/[id]", "page");
}

export async function endRetrospective(retrospectiveId: string) {
  try {
    const retrospective = await prisma.retrospective.update({
      where: { id: retrospectiveId },
      data: { status: "ended" },
      include: {
        sections: {
          include: {
            posts: true, // Include nested posts for each section
          },
          orderBy: { sortOrder: "asc" }, // Explicitly order sections by sortOrder
        },
      },
    });

    revalidatePath("/retro/[id]", "page");

    return retrospective;
  } catch (error) {
    console.log(error);
    throw new Error("Error ending retrospective");
  }
}

export async function generateAIContent(data: RetrospectiveData) {
  const { adminName, date, sections } = data;
  try {
    const geminiAPIKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiAPIKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const decryptedPostsSections = sections.map((section) => {
      const newPosts = section.posts.map((post) => {
        const decryptedPostContent = decryptMessage(post.content);
        return { ...post, content: decryptedPostContent };
      });
      return { ...section, posts: newPosts };
    });

    const formattedBody = {
      adminName: adminName,
      date: DateTime.fromJSDate(date).toFormat("MM/dd/yyyy"),
      sections: decryptedPostsSections,
    };

    const genAI = new GoogleGenerativeAI(geminiAPIKey);

    const generationConfig = {
      temperature: 2,
      responseMimeType: "text/plain",
    };

    // Ininitalise a generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "casual tone, natural output in a well formatted text",
      generationConfig,
    });

    const prompt = `Do a summary in a list format, about what have been talked in this retrospective meeting. Include the number of votes is there is any in +{number} format. If a post doesn't have any votes, then, don't mention anything about votes in that specific post. Separate sections and include the section titles. Do a summary of each section posts and format the post to an understandable way. Do not include Section number and do not include the word "Summary". Do not include the user id or name. At the beginning of the text, include the adminName and the date. Use ## for titles. Admin tag will be replace for Host. Host and Date labels should be in strong format. Inside sections, do a summary about the posts in one paragraph ${JSON.stringify(formattedBody)}`;

    // Pass the prompt to the model and retrieve the output
    const result = await model.generateContent(prompt);

    const response = result.response;
    const output = response.text();

    return output;
  } catch (error) {
    console.error(error);
  }
}
