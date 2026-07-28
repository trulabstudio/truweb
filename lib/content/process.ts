import { editableSite } from "@/lib/EDIT-SITE-HERE";
import type { ContentItem, HomeSectionContent } from "@/lib/types/content";

export const processContent = editableSite.homepage.process satisfies HomeSectionContent;
export const processSteps = editableSite.homepage.process.items satisfies ReadonlyArray<ContentItem>;
export const processAccessibility = {
  stepAriaLabel: editableSite.homepage.process.stepAriaLabel,
};
