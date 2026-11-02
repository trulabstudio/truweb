import { redirect } from "next/navigation";

// The dashboard now holds everything this page showed.
export default function ThreadsPerformancePage() {
  redirect("/admin/threads");
}
