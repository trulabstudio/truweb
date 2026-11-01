import { adminText } from "@/lib/admin/text";

// Sidebar links navigate without unloading the page, so beforeunload alone would miss them.
let hasUnsavedChanges = false;

export function setUnsavedChanges(value: boolean) {
  hasUnsavedChanges = value;
}

export function confirmLeave() {
  return !hasUnsavedChanges || window.confirm(adminText.leaveWarning);
}
