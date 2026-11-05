import { editableSite } from "@/lib/EDIT-SITE-HERE";
import type { NavigationLink } from "@/lib/types/site";

// Links to the packages section disappear with it when it is turned off in the admin panel.
export const navLinks = editableSite.navigation.navbarLinks.filter(
  (link) => editableSite.packages.showSection || !link.href.endsWith("#packages"),
) satisfies ReadonlyArray<NavigationLink>;

export const toolLinks = editableSite.navigation.toolLinks satisfies ReadonlyArray<NavigationLink>;

export const navigationCta = editableSite.navigation.mainCta satisfies NavigationLink;
export const navigationAccessibility = editableSite.navigation.accessibility;
