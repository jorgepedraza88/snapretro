import { nanoid } from "nanoid";

export function generateDefaultSections(numberOfSections: number) {
  const sectionTitles = [
    "🤓 Start doing",
    "❌ Stop doing",
    "👏🏼 Keep doing",
    "🎉 Shout outs",
  ];

  function generateDefaultSection(title: string, index: number) {
    return {
      id: `section_${nanoid(5)}`,
      title,
      sortOrder: index, // Set the order explicitly
      posts: {
        create: [],
      },
    };
  }

  const defaultSections = Array.from({ length: numberOfSections }, (_, index) =>
    generateDefaultSection(sectionTitles[index] || "New Section", index),
  );

  return defaultSections;
}
