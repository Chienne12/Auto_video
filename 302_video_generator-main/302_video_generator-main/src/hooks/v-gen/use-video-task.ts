"use client";

import { useTaskStore } from "@/stores";
import { TaskType } from "@/stores/slices/task-slice";

export const useVideoTask = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const videoAllTasks = tasks.filter(
    (it) => it.type === TaskType.VIDEO_GENERATION
  );
  // num
  const VIDEO_TASK_CONCURRENCY_MAX_LIMIT = 4;
  const TASK_ONPROCESS_COUNT = videoAllTasks.filter((it) => !it.result).length;
  // list
  const videoCompletedTasks = videoAllTasks.filter((it) => it.result);
  const videoOnProcessTasks = videoAllTasks.filter((it) => !it.result);
  // boolean
  const isOnProcess = TASK_ONPROCESS_COUNT > 0;
  const isFull = TASK_ONPROCESS_COUNT >= VIDEO_TASK_CONCURRENCY_MAX_LIMIT;
  const isEmpty = videoAllTasks.length < 1;

  return {
    allTasks: videoAllTasks,
    completedTasks: videoCompletedTasks,
    onProcessTasks: videoOnProcessTasks,
    maxTasksCount: VIDEO_TASK_CONCURRENCY_MAX_LIMIT,
    isOnProcess,
    isFull,
    isEmpty,
  };
};
