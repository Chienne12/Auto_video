import { create } from "zustand";
import { persist } from "zustand/middleware";

import { type ConfigStore, createConfigSlice } from "./slices/config-slice";
import { type FormStore, createFormSlice } from "./slices/form-slice";
import { type HistoryStore, createHistorySlice } from "./slices/history-slice";
import { type TaskStore, createTaskSlice } from "./slices/task-slice";

type AppStore = ConfigStore;
// export const useAppStore = create<AppStore>()((...a) => ({
//   ...createConfigSlice(...a),
// }));

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createConfigSlice(...a),
    }),
    {
      name: "config-store",
    }
  )
);

export const useFormStore = create<FormStore>()((...a) => ({
  ...createFormSlice(...a),
}));

export const useTaskStore = create<TaskStore>()((...a) => ({
  ...createTaskSlice(...a),
}));

// export const useTaskStore = create<TaskStore>()(
//   persist(
//     (...a) => ({
//       ...createTaskSlice(...a),
//     }),
//     {
//       name: "task-store",
//     }
//   )
// );

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (...a) => ({
      ...createHistorySlice(...a),
    }),
    {
      name: "history-store",
    }
  )
);
