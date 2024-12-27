import { nanoid } from "nanoid";

export function generateDefaultSections(numberOfSections: number) {
  const sectionTitles = [
    "🤓 Start doing",
    "❌ Stop doing",
    "👏🏼 Keep doing",
    "🎉 Shout outs",
  ];

  function generateDefaultSection(title: string) {
    return {
      id: `section_${nanoid(5)}`,
      title,
      posts: [],
    };
  }

  const defaultSections = Array.from({ length: numberOfSections }, (_, index) =>
    generateDefaultSection(sectionTitles[index] || "New Section"),
  );

  return defaultSections;
}
