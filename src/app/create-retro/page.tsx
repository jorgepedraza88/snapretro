import { CreateRetroForm } from "./components/create-retro-form";

export default function Page() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] h-screen flex justify-center">
      <div className="py-24">
        <h1 className="text-4xl font-medium">Creating your Retrospective</h1>
        <main className="flex flex-col justify-center items-center max-w-2xl">
          <CreateRetroForm />
        </main>
      </div>
    </div>
  );
}
