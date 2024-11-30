import { RetroCard } from "./retro-card";

// Representa un post individual dentro de una sección
export interface RetrospectivePost {
  id: string; // ID del post
  content: string; // Contenido del post
}

// Representa una sección (Start Doing, Stop Doing, Keep Doing)
export interface RetrospectiveSection {
  id: string; // ID único de la sección
  title: string; // Título de la sección (Start Doing, Stop Doing, etc.)
  posts: RetrospectivePost[]; // Lista de posts dentro de la sección
}

// Representa el JSON completo de la retrospectiva
export interface RetrospectiveData {
  retrospective: RetrospectiveSection[]; // Array de secciones de la retrospectiva
}

export async function RetroCardGroup() {
  const response = await fetch("http://localhost:3005/retrospective");
  const data: RetrospectiveSection[] = await response.json();

  return (
    <div className="grid grid-cols-3 gap-4">
      {data.map((section) => (
        <RetroCard key={section.id} section={section} title={section.title} />
      ))}
    </div>
  );
}
