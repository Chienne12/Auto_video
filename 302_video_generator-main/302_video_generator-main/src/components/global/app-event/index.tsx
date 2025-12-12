"use client";

import { useEffect } from "react";

import { initializeMonitor } from "@/lib/event";

const AppEvent = () => {
  useEffect(() => {
    initializeMonitor();
  }, []);
  return null;
};

export default AppEvent;
