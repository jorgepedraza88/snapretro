"use client";

import { useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { useParams } from "next/navigation";
import { revalidate } from "@/app/actions";

interface ChannelProviderProps {
  children: React.ReactNode;
}

export const ChannelProvider = ({ children }: ChannelProviderProps) => {
  const { id: retrospectiveId } = useParams<{ id: string }>();

  useEffect(() => {
    const channel = supabase.channel(`retrospective:${retrospectiveId}`);

    channel
      .on("broadcast", { event: "revalidate" }, async () => await revalidate())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [retrospectiveId]);

  return children;
};
