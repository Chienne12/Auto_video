/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from "immer";
import type { StateCreator } from "zustand";

export enum TaskType {
  VIDEO_GENERATION = "VIDEO_GENERATION",
}

// Define the TaskResult interface
export interface TaskResult {
  resultId?: string;
  videoUrl?: string;
  videoUrls?: string[];
  imageUrl?: string;
  error?: any; // 添加错误字段
}

// Task interface with an additional result property
export interface Task {
  id: string;
  timestamp: number;
  type: TaskType;
  payload: any; // Todo: optim
  result?: TaskResult; // Optional result property
  extendType?: string;
  extendPrompt?: string;
  extendRatio?: string;
  extendSeconds?: number;
  structureTransformation?: number;
}

export interface TaskStore {
  tasks: Task[];
  addTask: (payload: unknown, type: TaskType) => void;
  getTask: (id: string) => Task | undefined;
  deleteTask: (id: string) => void;
  clearTasks: () => void;
  clearTasksByType: (type: TaskType) => void;
  getTasksByType: (type: TaskType) => Task[];
  updateTaskResult: (id: string, result: TaskResult) => void; // New method
}

// Implementation of the createTaskSlice
export const createTaskSlice: StateCreator<TaskStore, [], [], TaskStore> = (
  set,
  get
) => ({
  tasks: [],
  addTask: (payload: unknown, type: TaskType) => {
    set(
      produce((draft) => {
        const newTask: Task = {
          id: Math.random().toString(36).substr(2, 9),
          payload,
          timestamp: Date.now(),
          type,
        };
        draft.tasks.push(newTask);
      })
    );
  },
  getTask: (id: string) => {
    return get().tasks.find((task) => task.id === id);
  },
  deleteTask: (id: string) => {
    set(
      produce((draft) => {
        draft.tasks = draft.tasks.filter(
          (task: { id: string }) => task.id !== id
        );
      })
    );
  },
  clearTasks: () => {
    set(
      produce((draft) => {
        draft.tasks = [];
      })
    );
  },
  clearTasksByType: (type: TaskType) => {
    set(
      produce((draft) => {
        draft.tasks = draft.tasks.filter(
          (task: { type: TaskType }) => task.type !== type
        );
      })
    );
  },
  getTasksByType: (type: TaskType) => {
    return get().tasks.filter((task) => task.type === type);
  },
  updateTaskResult: (id: string, result: TaskResult) => {
    set(
      produce((draft) => {
        const taskToUpdate = draft.tasks.find(
          (task: { id: string }) => task.id === id
        );
        if (taskToUpdate) {
          taskToUpdate.result = result;
        }
      })
    );
  },
});
