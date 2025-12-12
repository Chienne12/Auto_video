"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { env } from "@/env";
import useAuth from "@/hooks/auth";
import { useIsAuthed, useLocaleRouter } from "@/hooks/global";
import { useAppStore } from "@/stores";

const AppAuth = () => {
  // Use auth code
  const pathname = usePathname();
  const { replaceRouter } = useLocaleRouter();
  const { onAuth } = useAuth();
  const updateConfig = useAppStore((state) => state.updateConfig);
  const { isAuthRouter, isAuthPage } = useLocaleRouter();
  const isAuthed = useIsAuthed();

  useEffect(() => {
    // Ff alreally login or not the auth require router then just pass
    if (isAuthed || !isAuthRouter) return;

    // Use env api-key
    if (env.NEXT_PUBLIC_API_KEY) {
      // Update app configuration from the store with result
      updateConfig({
        apiKey: env.NEXT_PUBLIC_API_KEY,
        showBrand: env.NEXT_PUBLIC_SHOW_BRAND,
      });
      if (isAuthPage) {
        replaceRouter("/");
      }
      return;
    }

    // Use share code
    onAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
};

export default AppAuth;
