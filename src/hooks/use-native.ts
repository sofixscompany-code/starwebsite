import { useEffect, useCallback } from "react";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard } from "@capacitor/keyboard";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Preferences } from "@capacitor/preferences";
import { Network } from "@capacitor/network";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";

// Check if running in Capacitor (native app)
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

// Initialize native features
export async function initNativeFeatures(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#1E3A8A" });

    // Hide splash screen
    await SplashScreen.hide();
  } catch (err) {
    console.warn("Native init error:", err);
  }
}

// Setup push notifications
export async function setupPushNotifications(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== "granted") return;

    await PushNotifications.register();

    PushNotifications.addListener("registration", (token) => {
      console.log("Push registration success, token:", token.value);
      // Store token for later use
      Preferences.set({ key: "push_token", value: token.value });
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.error("Push registration error:", err);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("Push received:", notification);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      console.log("Push action performed:", action);
    });
  } catch (err) {
    console.warn("Push notification setup error:", err);
  }
}

// Check network status
export function useNetworkStatus() {
  const checkNetwork = useCallback(async () => {
    if (!isNativeApp()) return { connected: true };
    const status = await Network.getStatus();
    return status;
  }, []);

  return { checkNetwork };
}

// Haptic feedback
export async function triggerHaptic(style: "light" | "medium" | "heavy" = "light"): Promise<void> {
  if (!isNativeApp()) return;

  try {
    switch (style) {
      case "light":
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case "medium":
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case "heavy":
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
    }
  } catch {
    // Haptics not available
  }
}

// Handle Android back button
export function useBackButton(onBack: () => void): void {
  useEffect(() => {
    if (!isNativeApp()) return;

    const handler = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        onBack();
      }
    });

    return () => {
      handler.then((h) => h.remove());
    };
  }, [onBack]);
}

// Handle app state changes (foreground/background)
export function useAppState(onActive?: () => void, onInactive?: () => void): void {
  useEffect(() => {
    if (!isNativeApp()) return;

    const handler = App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        onActive?.();
      } else {
        onInactive?.();
      }
    });

    return () => {
      handler.then((h) => h.remove());
    };
  }, [onActive, onInactive]);
}

// Store data locally
export async function setLocal(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
}

// Get local data
export async function getLocal(key: string): Promise<string | null> {
  const result = await Preferences.get({ key });
  return result.value;
}

// Remove local data
export async function removeLocal(key: string): Promise<void> {
  await Preferences.remove({ key });
}

// Clear all local data
export async function clearLocal(): Promise<void> {
  await Preferences.clear();
}
