import { RetrospectiveData } from '@/types/Retro';
import { decryptMessage } from './cryptoClient';

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

export function generateMarkdownFromJSON(
  json: RetrospectiveData,
  participants: string[],
  symmetricKey: string
) {
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
        const decryptedPost = decryptMessage(post.content, symmetricKey);
        markdownTemplate += `    - ${decryptedPost} (${post.votes.length} votes)\n`;
      });
    } else {
      markdownTemplate += `  *No posts yet.*\n`;
    }

    markdownTemplate += `\n`;
  });

  return markdownTemplate;
}
