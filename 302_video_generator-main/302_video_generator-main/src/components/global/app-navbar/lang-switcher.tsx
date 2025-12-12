"use client";

import { useEffect, useState } from "react";

import { LanguagesIcon } from "lucide-react";

// Import UI components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocaleRouter } from "@/hooks/global";
import { Lang, languages } from "@/i18n/config";
import { useAppStore } from "@/stores";

type LangSwitcherProps = {
  locale: string;
};
export default function LangSwitcher({ locale }: LangSwitcherProps) {
  const [lang, setLang] = useState(locale);
  const { replaceLocale } = useLocaleRouter();

  const handlerChangeLang = (value: Lang) => {
    setLang(value);
    replaceLocale(value);
  };

  useEffect(() => {
    useAppStore.getState().updateConfig({ language: locale });
  }, [locale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <LanguagesIcon className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-12">
        <DropdownMenuRadioGroup
          value={lang}
          onValueChange={(value: string) => handlerChangeLang(value as Lang)}
        >
          {languages.map((l) => {
            return (
              <DropdownMenuRadioItem key={l.value} value={l.value}>
                {l.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
