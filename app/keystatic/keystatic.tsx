"use client";

import { makePage } from "@keystatic/next/ui/app";
import config from "../../keystatic.config";

// The site's light page styles are shared with the panel, so its dark theme is unreadable.
if (typeof window !== "undefined") {
  window.localStorage.setItem("keystatic-color-scheme", "light");
}

export default makePage(config);
