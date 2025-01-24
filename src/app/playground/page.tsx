"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { generateMarkdownFromJSON } from "../utils";
import { RetrospectiveData } from "@/types/Retro";
import { generateAIContent } from "../actions";

const dummyContent: RetrospectiveData = {
  id: "retro-001",
  adminId: "user-123",
  adminName: "Alice",
  date: new Date("2025-01-22T10:00:00.000Z"),
  enablePassword: true,
  password: "securepassword123",
  timer: 300,
  enableChat: true,
  sections: [
    {
      id: "section-001",
      title: "What went well",
      retrospectiveId: "retro-001",
      posts: [
        {
          id: "post-001",
          userId: "user-456",
          content: "The team collaborated effectively on the project.",
          votes: ["user-123", "user-789"],
        },
        {
          id: "post-002",
          userId: "user-789",
          content: "We met all sprint deadlines on time.",
          votes: ["user-123"],
        },
      ],
    },
    {
      id: "section-002",
      title: "What could be improved",
      retrospectiveId: "retro-001",
      posts: [
        {
          id: "post-003",
          userId: "user-456",
          content: "Better clarity on sprint goals.",
          votes: ["user-789"],
        },
        {
          id: "post-004",
          userId: "user-123",
          content: "More frequent check-ins during the sprint.",
          votes: [],
        },
      ],
    },
  ],
  status: "active",
};

export default function Page() {
  const [content, setContent] = useState("");
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isTyping && content) {
      let index = 0;

      const interval = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent((prev) => prev + content.charAt(index));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 5); // Adjust the speed here (50ms per character)

      return () => clearInterval(interval);
    }
  }, [isTyping, content]);

  async function generateContent(type: "manual" | "ai") {
    if (type === "manual") {
      const manualContent = generateMarkdownFromJSON(
        dummyContent,
        ["Jorge", "Alice", "Bob", "Charlie"],
        true,
      );
      setDisplayedContent(manualContent); // Reset displayed content
    } else if (type === "ai") {
      const aiContent =
        (await generateAIContent(
          dummyContent,
          ["Jorge", "Alice", "Bob", "Charlie"],
          true,
        )) || "error";

      setContent(aiContent);
      setDisplayedContent(""); // Reset displayed content
      setIsTyping(true);
    }
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col justify-center items-center w-full p-16 h-screen">
      <div className="flex gap-2">
        <Button onClick={() => generateContent("ai")}>
          Generate AI Content
        </Button>
        <Button onClick={() => generateContent("manual")}>
          Generate manual Content
        </Button>
      </div>

      <ReactMarkdown className="markdown">{displayedContent}</ReactMarkdown>
    </div>
  );
}
