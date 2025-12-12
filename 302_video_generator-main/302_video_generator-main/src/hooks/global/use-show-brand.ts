"use client";

import { useAppStore } from "@/stores";

export const useShowBrand = () => {
  const showBrand = useAppStore((state) => state.showBrand);
  const isShowBrand = showBrand === "true";
  return !!isShowBrand;
};
