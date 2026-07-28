import { editableSite } from "@/lib/EDIT-SITE-HERE";
import type { NavigationLink } from "@/lib/types/site";

export const navLinks = editableSite.navigation.navbarLinks satisfies ReadonlyArray<NavigationLink>;

export const toolLinks = editableSite.navigation.toolLinks satisfies ReadonlyArray<NavigationLink>;

export const navigationCta = editableSite.navigation.mainCta satisfies NavigationLink;
export const navigationAccessibility = editableSite.navigation.accessibility;
