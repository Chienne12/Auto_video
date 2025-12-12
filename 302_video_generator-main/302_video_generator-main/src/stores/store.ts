import { create } from "zustand";

import { ConfigStore, createConfigSlice } from "./slices/config-slice";

export const useStore = create<ConfigStore>()((...args) => ({
  ...createConfigSlice(...args),
}));
