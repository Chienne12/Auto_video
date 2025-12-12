"use client";

import { useIsAuthed, useShowBrand } from "@/hooks/global";

import { GithubHyperlink } from "./github-hyperlink";
import { InfoModal } from "./info-modal";
import LangSwitcher from "./lang-switcher";
import ThemeSwitcher from "./theme-switcher";

type AppNavbarProps = {
  locale: string;
};
export default function AppNavbar({ locale }: AppNavbarProps) {
  const showBrand = useShowBrand();
  const isAuthed = useIsAuthed();
  return (
    <nav className="sticky top-0 flex w-full items-center justify-between space-x-2 bg-background/95 p-2 shadow-sm">
      <div className="flex justify-start" />
      <div className="flex items-center justify-end">
        <GithubHyperlink className="mr-2" />
        {isAuthed && showBrand && <InfoModal />}
        <LangSwitcher locale={locale} />
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
