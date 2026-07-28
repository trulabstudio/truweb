import { editableSite } from "@/lib/EDIT-SITE-HERE";
import type { FaqItem, HomeSectionContent } from "@/lib/types/content";

export const faqContent = editableSite.faq satisfies HomeSectionContent;
export const faqs = editableSite.faq.items satisfies ReadonlyArray<FaqItem>;
