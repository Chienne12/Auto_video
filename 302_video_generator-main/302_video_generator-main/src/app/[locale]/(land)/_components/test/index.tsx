"use client";

import { Button } from "@/components/ui/button";
import {
  useClientTranslation,
  useIsAuthed,
  useLocaleRouter,
} from "@/hooks/global";
import { useAppStore } from "@/stores";

const LogOutButton = () => {
  const { t } = useClientTranslation();
  const { pushRouter } = useLocaleRouter();
  const updateConfig = useAppStore((state) => state.updateConfig);
  const handleLogout = () => {
    updateConfig({ apiKey: "", code: "" });
    localStorage.setItem("code", "");
    sessionStorage.setItem("code", "");
    pushRouter("/auth");
  };
  return <Button onClick={handleLogout}>{t("global:system.logout")}</Button>;
};

const Test = () => {
  const isAuthed = useIsAuthed();

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-4 p-4 text-center">
      {isAuthed && <LogOutButton />}
    </div>
  );
};

export default Test;
