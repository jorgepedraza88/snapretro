import { redirect } from "next/navigation";

import { getRetrospetiveData } from "@/app/actions";
import { RetroContextProvider } from "./components/RetroContextProvider";
import { ChatFooter } from "@/components/ChatFooter";

import { MainContent } from "./MainContent";
import { RetroProtectedWrapper } from "./RetroProtectedWrapper";
import { Navigation } from "@/components/Navigation";
import { OnlineUsers } from "./components/OnlineUsers";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const retrospectiveId = (await params).id;
  const initialData = await getRetrospetiveData(retrospectiveId);

  if (!initialData) {
    redirect("/not-found");
  }

  return (
    <RetroProtectedWrapper data={initialData}>
      <RetroContextProvider data={initialData}>
        <Navigation />
        <div className="lg:flex gap-2">
          <OnlineUsers />
          <MainContent data={initialData} />
          <ChatFooter />
        </div>
      </RetroContextProvider>
    </RetroProtectedWrapper>
  );
}
