"use client";

import { useHistoryStore } from "@/stores";
import { HistoryType } from "@/stores/slices/history-slice";

export const useVideoHistory = () => {
  const historys = useHistoryStore((state) => state.historys);
  const videoAllHistorys = historys.filter(
    (it) => it.type === HistoryType.VIDEO_GENERATION
  );
  // boolean
  const isEmpty = videoAllHistorys.length < 1;

  return {
    allHistorys: videoAllHistorys,
    isEmpty,
  };
};
