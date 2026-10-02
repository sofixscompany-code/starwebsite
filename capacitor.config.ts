import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.starcoaching.institute",
  appName: "Star Coaching Institute",
  webDir: "dist",
  server: {
    androidScheme: "https",
    url: "https://starcoachinginstitutenepal.web.app",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#1E3A8A",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
      showSpinner: true,
      spinnerColor: "#D4AF37",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1E3A8A",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
    },
    App: {
      // Handle back button on Android
    },
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
};

export default config;
