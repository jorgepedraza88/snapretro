import { RetrospectiveData } from "@/types/Retro";
import crypto from "crypto";

export function generateDefaultSections(numberOfSections: number) {
  function generateDefaultSection(title: string, index: number) {
    return {
      title,
      sortOrder: index, // Set the order explicitly
      posts: {
        create: [],
      },
    };
  }

  const defaultSections = Array.from({ length: numberOfSections }, (_, index) =>
    generateDefaultSection(`Untitled Section`, index),
  );

  return defaultSections;
}

export const encryptMessage = (message: string) => {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY
    ? Buffer.from(process.env.NEXT_PUBLIC_ENCRYPTION_KEY, "base64")
    : null;
  const iv = process.env.NEXT_PUBLIC_ENCRYPTION_IV
    ? Buffer.from(process.env.NEXT_PUBLIC_ENCRYPTION_IV, "base64")
    : null;

  if (!key || !iv) {
    throw new Error("Encryption fails");
  }

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};

export const decryptMessage = (encryptedMessage: string) => {
  const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY
    ? Buffer.from(process.env.NEXT_PUBLIC_ENCRYPTION_KEY, "base64")
    : null;
  const iv = process.env.NEXT_PUBLIC_ENCRYPTION_IV
    ? Buffer.from(process.env.NEXT_PUBLIC_ENCRYPTION_IV, "base64")
    : null;

  if (!key || !iv) {
    throw new Error("Encryption fails");
  }

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedMessage, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

export function generateHTMLFromJSON(json: RetrospectiveData): string {
  let htmlTemplate = `<div class='retrospective'>`;

  // Add header details
  htmlTemplate += `
    <div class='header'>
      <h2>Retrospective - ${json.adminId}</h2>
      <p><b>Date:</b> ${new Date(json.date).toLocaleString()}</p>
    </div>
  `;

  // Process sections
  htmlTemplate += `<div class='sections'>`;
  json.sections.forEach((section) => {
    htmlTemplate += `
      <div class='section'>
        <h3><b>${section.title}</b></h3>
        <ul>`;

    if (section.posts.length > 0) {
      section.posts.forEach((post) => {
        const decryptedPost = decryptMessage(post.content);
        htmlTemplate += `<li>${decryptedPost}</li>`;
      });
    } else {
      htmlTemplate += `<li><i>No posts yet.</i></li>`;
    }

    htmlTemplate += `</ul>
      </div>`;
  });
  htmlTemplate += `</div>`;

  htmlTemplate += `</div>`;

  return htmlTemplate;
}
