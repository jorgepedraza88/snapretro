import { supabase } from "@/supabaseClient";

function sendBroadcast<T>(retrospectiveId: string, event: string, payload: T) {
  supabase.channel(`retrospective:${retrospectiveId}`).send({
    type: "broadcast",
    event,
    payload,
  });
}

export async function writingAction(
  retroId: string,
  sectionId: string,
  userId: string,
  action: "start" | "stop",
) {
  const event = action === "start" ? "writing" : "stop-writing";

  sendBroadcast(retroId, event, {
    sectionId,
    userId,
  });
}

export async function revalidatePageBroadcast(retroId: string) {
  sendBroadcast(retroId, "revalidate", {});
}

export async function endRetroBroadcast(retroId: string, finalSummary: string) {
  sendBroadcast(retroId, "end-retro", {
    finalSummary,
  });
}

export async function changeAdminBroadcast(
  retroId: string,
  newAdminId: string,
) {
  sendBroadcast(retroId, "assign-new-admin", {
    newAdminId,
  });
}

export async function removeUserBroadcast(retroId: string, userId: string) {
  sendBroadcast(retroId, "disconnect-user", {
    userId,
  });
}

export async function handleTimerBroadcast(
  retroId: string,
  timerState: "on" | "off" | "reset",
) {
  if (timerState === "reset") {
    sendBroadcast(retroId, "reset-timer", {});
  }

  sendBroadcast(retroId, "timer", {
    timerState,
  });
}

export async function editAdminSettingsBroadcast(
  retroId: string,
  allowMessages: boolean,
  allowVotes: boolean,
) {
  sendBroadcast(retroId, "settings", {
    allowMessages,
    allowVotes,
  });
}
