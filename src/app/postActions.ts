"use server";
import { RetrospectiveSection } from "@/types/Retro";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { generateDefaultSections } from "./utils";

interface CreatePostParams {
  section: RetrospectiveSection;
  newPost: {
    userId: string;
    content: string;
    votes: string[];
  };
  retrospectiveId: string;
}

interface DestroyPostParams {
  section: RetrospectiveSection;
  postId: string;
  retrospectiveId: string;
}

export interface CreateRetroSpectiveData {
  id: string;
  adminId: string;
  avatarUrl: string;
  adminName: string;
  date: string;
  timer: 300;
  allowVotes: boolean;
  enableChat: boolean;
  enablePassword: boolean;
  password: string | null;
  sectionsNumber: number;
  participants: Participant[];
}

export type Participant = {
  id: string;
  username: string;
  isAdmin: boolean;
};

export async function createPost({
  section,
  newPost,
  retrospectiveId,
}: CreatePostParams) {
  const { userId, content, votes } = newPost;

  const response = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
  );

  if (!response.ok) {
    throw new Error("Error fetching retrospective");
  }

  const retrospective = await response.json();

  // Update the specific section
  const updatedSections = retrospective.sections.map(
    (sect: RetrospectiveSection) =>
      sect.id === section.id
        ? {
            ...sect,
            posts: [...sect.posts, { id: nanoid(5), userId, content, votes }],
          }
        : sect,
  );

  const res = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sections: updatedSections,
      }),
    },
  );

  if (!res.ok) {
    throw new Error("Error creating post");
  }

  revalidatePath("/retro/[id]", "page");
}

export async function revalidate() {
  revalidatePath("/retro/[id]", "page");
}

export async function destroyPost({
  section,
  postId,
  retrospectiveId,
}: DestroyPostParams) {
  const response = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
  );

  if (!response.ok) {
    throw new Error("Error fetching retrospective");
  }

  const retrospective = await response.json();

  // Filter the post you want to delete
  const updatedSections = retrospective.sections.map(
    (sect: RetrospectiveSection) =>
      sect.id === section.id
        ? { ...sect, posts: sect.posts.filter((post) => post.id !== postId) }
        : sect,
  );

  const res = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sections: updatedSections,
      }),
    },
  );

  if (!res.ok) {
    throw new Error("Error deleting post");
  }

  revalidatePath("/retro/[id]", "page");
}

export async function createRetro(data: CreateRetroSpectiveData) {
  const { sectionsNumber, ...restData } = data;
  const res = await fetch(`http://localhost:3005/retrospectives`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...restData,
      sections: generateDefaultSections(sectionsNumber),
    }),
  });

  if (!res.ok) {
    throw new Error("Error creating retrospective");
  }

  const response = await res.json();

  return response;
}

export async function editRetroTitle(data: {
  retrospectiveId: string;
  sectionId: string;
  title: string;
}) {
  const { retrospectiveId, sectionId, title } = data;

  const response = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
  );

  if (!response.ok) {
    throw new Error("Error fetching retrospective");
  }

  const retrospective = await response.json();

  const updatedSections = retrospective.sections.map(
    (section: RetrospectiveSection) =>
      section.id === sectionId ? { ...section, title } : section,
  );

  const res = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sections: updatedSections,
      }),
    },
  );

  const finalResponse = await res.json();

  console.log("edit section title", finalResponse);

  revalidatePath("/retro/[id]", "page");
}

export async function editRetroAdminId(data: {
  retrospectiveId: string;
  adminId: string;
}) {
  const { retrospectiveId, adminId } = data;

  const res = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminId,
      }),
    },
  );
  const response = await res.json();

  revalidatePath("/retro/[id]", "page");
}

export async function addParticipants(data: {
  retrospectiveId: string;
  participants: Participant[];
}) {
  const { retrospectiveId, participants } = data;

  const res = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participants,
      }),
    },
  );
  const response = await res.json();

  console.log("add participant", response);

  revalidatePath("/retro/[id]", "page");
}

export async function handleVotePost({
  sectionId,
  postId,
  retrospectiveId,
  userId,
  hasVoted,
}: {
  sectionId: string;
  postId: string;
  retrospectiveId: string;
  userId: string;
  hasVoted: boolean;
}) {
  const response = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
  );

  if (!response.ok) {
    throw new Error("Error fetching retrospective");
  }

  const retrospective = await response.json();

  let updatedSections;

  if (hasVoted) {
    updatedSections = retrospective.sections.map(
      (sect: RetrospectiveSection) =>
        sect.id === sectionId
          ? {
              ...sect,
              posts: sect.posts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      votes: post.votes.filter((vote) => vote !== userId),
                    }
                  : post,
              ),
            }
          : sect,
    );
  } else {
    updatedSections = retrospective.sections.map(
      (sect: RetrospectiveSection) =>
        sect.id === sectionId
          ? {
              ...sect,
              posts: sect.posts.map((post) =>
                post.id === postId
                  ? { ...post, votes: [...post.votes, userId] }
                  : post,
              ),
            }
          : sect,
    );
  }

  const res = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sections: updatedSections,
      }),
    },
  );

  if (!res.ok) {
    throw new Error("Error voting post");
  }

  revalidatePath("/retro/[id]", "page");
}
