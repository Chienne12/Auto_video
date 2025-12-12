import { useAppStore } from "@/stores";

export const useIsAuthed = () => {
  const apiKey = useAppStore((state) => state.apiKey);
  const isAuthed = !!apiKey;
  return isAuthed;
};
