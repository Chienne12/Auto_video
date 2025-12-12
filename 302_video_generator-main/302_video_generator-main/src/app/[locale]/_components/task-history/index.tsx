"use client";

import { HistoryIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useClientTranslation } from "@/hooks/global";

import { HistoryContent } from "./history-content";

export function HistoryModal() {
  const { t } = useClientTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant={"outline"}>
          <HistoryIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("global:history.title")}</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <HistoryContent />
      </DialogContent>
    </Dialog>
  );
}
