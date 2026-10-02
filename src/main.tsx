import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";
import "./styles.css";

// Initialize native features for Android app
import { initNativeFeatures, setupPushNotifications } from "@/hooks/use-native";

const queryClient = new QueryClient();

// Initialize native features on app load
initNativeFeatures().catch(() => {});
setupPushNotifications().catch(() => {});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
