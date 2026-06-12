"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export default function PushNotificationsManager() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const registerPush = async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === "prompt") {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== "granted") {
          console.warn("Push: User denied permissions");
          return;
        }

        await PushNotifications.register();

        PushNotifications.addListener("registration", (token) => {
          console.log("Push registration success, token: " + token.value);
        });

        PushNotifications.addListener("registrationError", (error) => {
          console.error("Error on registration: " + JSON.stringify(error));
        });

        PushNotifications.addListener("pushNotificationReceived", (notification) => {
          console.log("Push received: " + JSON.stringify(notification));
        });

        PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
          console.log("Push action performed: " + JSON.stringify(notification));
        });
      } catch (err) {
        console.warn("PushNotificationsManager: Failed to init", err);
      }
    };

    registerPush();

    return () => {
      // Cleanup is best-effort
      import("@capacitor/push-notifications")
        .then(({ PushNotifications }) => PushNotifications.removeAllListeners())
        .catch(() => {});
    };
  }, []);

  return null;
}
