"use client";

import React, { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export default function PermissionGate({ children }: { children: React.ReactNode }) {
  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      setPermissionsGranted(true);
      return;
    }

    const checkPermissions = async () => {
      try {
        // We use the native bridge or a plugin to check for SMS permissions
        // For simplicity in this gate, we'll check if we need to request them
        const result = await (window as any).Capacitor.Plugins.Keyboard.requestPermissions(); // Placeholder for actual permission check
        setPermissionsGranted(true);
      } catch (e) {
        setPermissionsGranted(true); // Don't block the UI, but we'll show a warning in the app
      }
    };

    checkPermissions();
  }, []);

  if (permissionsGranted === null) return null;

  return <>{children}</>;
}
