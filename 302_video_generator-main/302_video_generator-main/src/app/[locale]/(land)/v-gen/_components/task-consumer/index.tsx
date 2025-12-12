"use client";

import { useEffect, useRef } from "react";

import { useVideoTask } from "@/hooks/v-gen/use-video-task";
import { cn } from "@/lib/utils";

import TaskExample from "../task-example";
import TaskItem from "../task-item";

type TaskConsumerProps = {
  className?: string;
};
const TaskConsumer = ({ className }: TaskConsumerProps) => {
  const scrollRef = useRef<HTMLEmbedElement | null>(null);
  const videoTask = useVideoTask();

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 30);
  }, []);

  if (!videoTask.allTasks.length) {
    return <TaskExample />;
  }

  return (
    <div
      ref={scrollRef}
      className={cn("overflow-y-scroll scroll-smooth", className)}
    >
      <div className="flex w-full flex-col gap-4">
        {videoTask.allTasks.map((task, index) => (
          <TaskItem top={index} taskData={task} key={task.id} />
        ))}
      </div>
    </div>
  );
};

export default TaskConsumer;
