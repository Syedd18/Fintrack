"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

export default function AppUrlManager() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cleanup: (() => void) | undefined;

    const initAppUrl = async () => {
      try {
        const { App } = await import("@capacitor/app");
        const handler = App.addListener("appUrlOpen", (event) => {
          const slug = event.url.split("://").pop();
          if (slug) {
            router.push("/" + slug);
          }
        });
        cleanup = () => {
          handler.then((h) => h.remove());
        };
      } catch (err) {
        console.warn("AppUrlManager: Failed to init", err);
      }
    };

    initAppUrl();

    return () => {
      cleanup?.();
    };
  }, []);

  return null;
}
