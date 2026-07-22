"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site-config";

export default function Preloader() {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    let frame: number | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    let unmountTimer: ReturnType<typeof setTimeout> | undefined;
    let dismissed = false;

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      setIsLeaving(true);
      unmountTimer = setTimeout(() => setIsMounted(false), 240);
    }

    if (document.readyState === "complete") {
      frame = requestAnimationFrame(dismiss);
    } else {
      window.addEventListener("load", dismiss, { once: true });
      fallbackTimer = setTimeout(dismiss, 1200);
    }

    return () => {
      window.removeEventListener("load", dismiss);
      if (frame) cancelAnimationFrame(frame);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (unmountTimer) clearTimeout(unmountTimer);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`preloader-shell fixed inset-0 z-[9999] grid place-items-center bg-trulab-bg ${
        isLeaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-label={`Loading ${siteConfig.name}`}
      role="status"
    >
      <div
        className={`preloader-content grid justify-items-center gap-7 ${
          isLeaving ? "translate-y-[-8px] scale-[1.015] opacity-0 blur-sm" : "translate-y-0 scale-100 opacity-100 blur-0"
        }`}
      >
        <img
          src={siteConfig.assets.logoFull}
          alt={siteConfig.name}
          className="h-auto w-[300px] max-w-[78vw] animate-preloader-logo sm:w-[430px] lg:w-[560px]"
          draggable={false}
          onError={(event) => {
            event.currentTarget.src = siteConfig.assets.logo;
            event.currentTarget.className = "h-20 w-20 animate-preloader-logo rounded-2xl object-cover sm:h-24 sm:w-24";
          }}
        />

        <div className="h-1.5 w-44 overflow-hidden rounded-full bg-black/8 sm:w-56">
          <div className="h-full w-full origin-left animate-preloader-bar rounded-full bg-trulab-accent" />
        </div>
      </div>
    </div>
  );
}
