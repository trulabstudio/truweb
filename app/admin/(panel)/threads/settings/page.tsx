import { redirect } from "next/navigation";
import ThreadsPageFrame from "@/components/admin/ThreadsPageFrame";
import ThreadsSettingsForm from "@/components/admin/ThreadsSettingsForm";
import ThreadsSetupNotice from "@/components/admin/ThreadsSetupNotice";
import { isAdmin } from "@/lib/admin/auth";
import { adminText } from "@/lib/admin/text";
import { getSettings, ThreadsSetupError } from "@/lib/threads/db";
import { currentFocus, savedSnapshot, savedTopics } from "@/lib/threads/engine";
import { bestHours } from "@/lib/threads/metrics";

export const dynamic = "force-dynamic";

const text = adminText.threads;

export default async function ThreadsSettingsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let content;
  try {
    const [settings, snapshot, topics] = await Promise.all([getSettings(), savedSnapshot(), savedTopics()]);
    const focus = await currentFocus(snapshot?.posts ?? []);
    content = <ThreadsSettingsForm initial={settings} hours={bestHours(snapshot?.posts ?? [], Date.now())} topics={topics} focus={focus} />;
  } catch (error) {
    if (!(error instanceof ThreadsSetupError)) throw error;
    content = <ThreadsSetupNotice />;
  }

  return <ThreadsPageFrame kicker={text.settingsKicker} title={text.settings} description={text.settingsDescription}>{content}</ThreadsPageFrame>;
}
