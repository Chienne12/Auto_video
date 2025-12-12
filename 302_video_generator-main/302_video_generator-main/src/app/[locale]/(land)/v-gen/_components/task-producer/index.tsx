"use client";

import * as React from "react";

import { CaretSortIcon } from "@radix-ui/react-icons";
import { Trash2 } from "lucide-react";

import VideoForm from "@/components/forms/v-gen";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useClientTranslation } from "@/hooks/global";
import { useVideoTask } from "@/hooks/v-gen/use-video-task";
import { useTaskStore } from "@/stores";
import { TaskType } from "@/stores/slices/task-slice";

import { HistoryModal } from "../task-history";

const TaskProducer = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const clearTasksByType = useTaskStore((state) => state.clearTasksByType);
  const videoTask = useVideoTask();
  const { t } = useClientTranslation();

  return (
    <Card className="w-full rounded-none">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle>{t("v-gen:task.title")}</CardTitle>
            <CardDescription>
              {!videoTask.isOnProcess
                ? t("v-gen:task.empty")
                : t("v-gen:task.total", {
                    count: videoTask.onProcessTasks.length,
                  })}
            </CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <CaretSortIcon className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="max-h-[calc(100vh-24.5rem)] overflow-y-auto">
            <VideoForm disabled={videoTask.isFull} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
      <CardFooter className="flex justify-between">
        <HistoryModal />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={"icon"}
                variant="outline"
                className="hover:border-red-500 hover:text-red-500"
                onClick={() => clearTasksByType(TaskType.VIDEO_GENERATION)}
              >
                <Trash2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("v-gen:task.clear")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default TaskProducer;
