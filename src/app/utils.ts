import { nanoid } from "nanoid";

export function generateDefaultSections() {
  const defaultSections = [
    {
      id: `section_${nanoid(5)}`,
      title: "🤓 Start doing",
      posts: [],
    },
    {
      id: `section_${nanoid(5)}`,
      title: "❌ Stop doing",
      posts: [],
    },
    {
      id: `section_${nanoid(5)}`,
      title: "👏🏼 Keep doing",
      posts: [],
    },
  ];
  return defaultSections;
}
