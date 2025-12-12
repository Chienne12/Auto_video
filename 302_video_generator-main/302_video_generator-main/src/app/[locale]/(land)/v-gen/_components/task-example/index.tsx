/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import VideoPlayer from "@/components/common/video-player";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useClientTranslation } from "@/hooks/global";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/stores";

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */

const TaskExample = () => {
  const { t } = useClientTranslation();
  const taskData = {
    payload: {
      model: "luma",
      prompt: t("v-gen:example.prompt"),
    },
    result: {
      videoUrl:
        "https://file.302.ai/gpt/imgs/20250507/9e69738c2df1473387022aeb1b73f860.mp4",
    },
  };

  const updateVideoForm = useFormStore(
    (state) => state.videoFormState.setFormData
  );

  return (
    <Card className={cn("w-full] relative rounded-none")}>
      <CardHeader className="pb-2">
        <CardTitle />
        <CardDescription className="py-1 text-sm text-slate-400">
          {taskData.payload.prompt}
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <VideoPlayer url={taskData.result.videoUrl} />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => updateVideoForm(taskData.payload)}>
          {t("v-gen:example.try")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskExample;
