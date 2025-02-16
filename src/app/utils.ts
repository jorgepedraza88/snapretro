import crypto from 'crypto';

import { RetrospectiveData } from '@/types/Retro';

export function generateDefaultSections(numberOfSections: number) {
  function generateDefaultSection(title: string, index: number) {
    const defaultNames = ['What went well?', 'What could be improved?', 'Action items'];

    return {
      title: defaultNames[index] || title,
      sortOrder: index, // Set the order explicitly
      posts: {
        create: []
      }
    };
  }

  const defaultSections = Array.from({ length: numberOfSections }, (_, index) =>
    generateDefaultSection(`Untitled Section`, index)
  );

  return defaultSections;
}

export const encryptMessage = (message: string) => {
  const key = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'base64')
    : null;
  const iv = process.env.ENCRYPTION_IV ? Buffer.from(process.env.ENCRYPTION_IV, 'base64') : null;

  if (!key || !iv) {
    throw new Error('Encryption fails');
  }

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
};

export const decryptMessage = (encryptedMessage: string) => {
  const key = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'base64')
    : null;
  const iv = process.env.ENCRYPTION_IV ? Buffer.from(process.env.ENCRYPTION_IV, 'base64') : null;

  if (!key || !iv) {
    throw new Error('Encryption fails');
  }

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

export function generateMarkdownFromJSON(json: RetrospectiveData, participants: string[]): string {
  let markdownTemplate = `# Retrospective\n\n`;

  // Add header details
  markdownTemplate += `**Retrospective Meeting:**\n\n`;
  markdownTemplate += `* **Host**: ${json.adminName || 'Not specified'}\n`;
  markdownTemplate += `* **Date**: ${new Date(json.date).toLocaleString()}\n`;
  markdownTemplate += `* **Participants**: ${participants?.join(', ') || 'Not specified'}\n\n`;

  json.sections.forEach((section) => {
    markdownTemplate += `- **${section.title}:**\n`;

    if (section.posts.length > 0) {
      section.posts.forEach((post) => {
        const decryptedPost = decryptMessage(post.content);
        markdownTemplate += `    - ${decryptedPost} (${post.votes.length} votes)\n`;
      });
    } else {
      markdownTemplate += `  *No posts yet.*\n`;
    }

    markdownTemplate += `\n`;
  });

  return markdownTemplate;
}
