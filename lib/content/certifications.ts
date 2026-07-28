import { editableSite } from "@/lib/EDIT-SITE-HERE";
import type { ContentItem, HomeSectionContent } from "@/lib/types/content";

export const certificationsContent = editableSite.homepage.certifications satisfies HomeSectionContent;
export const certifications = editableSite.homepage.certifications.items satisfies ReadonlyArray<ContentItem>;
