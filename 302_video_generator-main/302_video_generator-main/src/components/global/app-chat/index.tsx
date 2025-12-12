"use client";

import Script from "next/script";

import { useIsMobile, useShowBrand } from "@/hooks/global";

const AppChat = () => {
  const isMobile = useIsMobile();
  const showBrand = useShowBrand();
  if (isMobile || !showBrand) return null;
  return (
    <Script src="https://assets.salesmartly.com/js/project_177_61_1649762323.js" />
  );
};

export default AppChat;
