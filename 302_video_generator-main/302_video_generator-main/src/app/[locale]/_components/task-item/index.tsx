"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  ChevronUpSquareIcon,
  Download,
  Edit,
  RectangleHorizontal,
  RotateCcwIcon,
  Trash2Icon,
  UnfoldHorizontal,
  Volume2,
  Wand2,
} from "lucide-react";

import ErrorRenderer from "@/components/common/error-renderer";
import { DotLoader } from "@/components/common/loader-renderer";
import VideoPlayer from "@/components/common/video-player";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useClientTranslation } from "@/hooks/global";
import FileManager from "@/lib/file";
import { cn } from "@/lib/utils";
import { extendVideo, generateVideo } from "@/services/v-gen";
import { useFormStore, useHistoryStore, useTaskStore } from "@/stores";
import { HistoryType } from "@/stores/slices/history-slice";

/* eslint-disable @typescript-eslint/no-explicit-any */

type TaskItemProps = {
  top: number;
  taskData: any;
};

const TaskItem = ({ top, taskData }: TaskItemProps) => {
  const { id: taskId } = taskData;
  const [frameImageUrl, setFrameImageURL] = useState("");
  const queryClient = useQueryClient();
  const updateTaskResult = useTaskStore((state) => state.updateTaskResult);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const addHistory = useHistoryStore((state) => state.addHistory);
  const updateVideoForm = useFormStore(
    (state) => state.videoFormState.setFormData
  );
  const { t } = useClientTranslation();

  // Create Video
  const {
    error: createVideoError,
    data: videoData,
    isFetching,
    refetch: refetchVideo,
  } = useQuery({
    queryKey: ["video", taskId],
    queryFn: () => generateVideo(taskData),
    retry: 0,
    enabled: !taskData.result,
  });

  // Extend Video
  const ExtendVideoMutation = useMutation({
    mutationFn: extendVideo,
    onSuccess: (data) => {
      queryClient.setQueryData(["video", taskId], data);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  // State for extension dialog
  const [showDialog, setShowDialog] = useState(false);
  const [extensionType, setExtensionType] = useState("");
  const [extensionPrompt, setExtensionPrompt] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("5:3");
  const [selectedSeconds, setSelectedSeconds] = useState(5);
  const [structureTransformation, setStructureTransformation] = useState(0.9);
  // const [selectedDuration, setSelectedDuration] = useState(4);
  // const [selectedResolution, setSelectedResolution] = useState("720p");

  // Handler Extend Video
  const handleExtendVideo = (
    type: "ratio" | "style" | "time" | "upscale" | "audio"
  ) => {
    setExtensionType(type);
    if (type === "time") {
      ExtendVideoMutation.mutate({ ...taskData, extendType: type });
    } else {
      setShowDialog(true);
    }
  };

  // Handle extension submission
  const handleSubmit = () => {
    setShowDialog(false);
    const payload = {
      ...taskData,
      extendType: extensionType,
      extendRatio: extensionType === "ratio" ? selectedRatio : undefined,
      extendPrompt: extensionPrompt,
      extendSeconds: selectedSeconds,
      structureTransformation: structureTransformation,
      // extendDuration: selectedDuration,
      // extendResolution: selectedResolution,
    };
    ExtendVideoMutation.mutate(payload);
  };

  // Reset dialog state when closing
  const handleDialogClose = () => {
    setShowDialog(false);
    setExtensionPrompt("");
    setSelectedRatio("5:3");
    setSelectedSeconds(5);
    setStructureTransformation(0.9);
    // setSelectedDuration(4);
    // setSelectedResolution("720p");
  };

  // Restore Video
  useEffect(() => {
    if (videoData) {
      updateTaskResult(taskId, {
        resultId: videoData.resultId,
        videoUrl: videoData.videoUrl,
      });
      // save history for v-gen type
      addHistory(
        { ...taskData, result: videoData },
        HistoryType.VIDEO_GENERATION
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoData, taskId, updateTaskResult, addHistory]);

  useEffect(() => {
    const frameImageFiel =
      taskData.payload.firstFrame || taskData.payload.lastFrame;
    if (frameImageFiel) {
      setFrameImageURL(frameImageFiel);
    }
  }, [taskData.payload]);

  return (
    <Card className={cn("relative w-full rounded-none")}>
      <CardHeader className="pb-2">
        <CardTitle>
          <div className="absolute left-5 top-[-4px] w-8 rounded-b-sm border bg-primary py-5 text-center text-white shadow-2xl">
            {top + 1}
          </div>
          <div className="flex w-full flex-col items-center justify-between gap-1 md:flex-row">
            <div className="flex w-full flex-col items-start justify-between pl-8">
              <span className="text-md font-medium">
                {t(`v-gen:form.model.option.${taskData.payload.model}`)}
              </span>
              <span className="text-sans text-xs italic text-slate-400">
                {dayjs(taskData.timestamp).format("YYYY-MM-DD hh:mm:ss")}
              </span>
            </div>
            <div className="flex w-full justify-end gap-2 md:justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="hover:border-purple-500 hover:text-purple-500"
                      size={"sm"}
                      onClick={() => handleExtendVideo("audio")}
                      disabled={
                        isFetching ||
                        ExtendVideoMutation.isPending ||
                        !taskData.result?.videoUrl
                      }
                    >
                      <Volume2 size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("v-gen:action.extend_video_audio")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {["vidu"].includes(taskData.payload.model) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="hover:border-purple-500 hover:text-purple-500"
                        size={"sm"}
                        onClick={() => handleExtendVideo("upscale")}
                        disabled={
                          isFetching ||
                          ExtendVideoMutation.isPending ||
                          !taskData.result?.resultId ||
                          taskData.payload.viduTime === "8"
                        }
                      >
                        <ChevronUpSquareIcon size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("v-gen:action.extend_video_upscale")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {["kling", "luma"].includes(taskData.payload.model) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="hover:border-purple-500 hover:text-purple-500"
                        size={"sm"}
                        onClick={() => handleExtendVideo("time")}
                        disabled={
                          isFetching ||
                          ExtendVideoMutation.isPending ||
                          !taskData.result?.resultId
                        }
                      >
                        <UnfoldHorizontal size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("v-gen:action.extend_video_time")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="hover:border-purple-500 hover:text-purple-500"
                      size={"sm"}
                      onClick={() => handleExtendVideo("style")}
                      disabled={
                        isFetching ||
                        ExtendVideoMutation.isPending ||
                        !taskData.result?.videoUrl
                      }
                    >
                      <Wand2 size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("v-gen:action.extend_video_style")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="hover:border-purple-500 hover:text-purple-500"
                      size={"sm"}
                      onClick={() => handleExtendVideo("ratio")}
                      disabled={
                        isFetching ||
                        ExtendVideoMutation.isPending ||
                        !taskData.result?.videoUrl
                      }
                    >
                      <RectangleHorizontal size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("v-gen:action.extend_video_ratio")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="hover:border-purple-500 hover:text-purple-500"
                      size={"icon"}
                      disabled={isFetching || ExtendVideoMutation.isPending}
                      onClick={() => refetchVideo()}
                    >
                      <RotateCcwIcon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("v-gen:action.recreate_video")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="hover:border-purple-500 hover:text-purple-500"
                      size={"icon"}
                      onClick={() => updateVideoForm(taskData.payload)}
                    >
                      <Edit size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("v-gen:action.edit_video")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={"outline"}
                      size={"icon"}
                      className="hover:border-red-500 hover:text-red-500"
                      onClick={() => deleteTask(taskId)}
                    >
                      <Trash2Icon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("v-gen:action.delete_task")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      disabled={!taskData.result}
                      size={"icon"}
                      onClick={() =>
                        FileManager.downloadVideo(taskData.result.videoUrl)
                      }
                    >
                      <Download size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("v-gen:action.download_video")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardTitle>
        <CardDescription className="py-1 text-sm text-slate-400">
          {taskData.payload.prompt}
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        <div className="relative w-full">
          {(isFetching || ExtendVideoMutation.isPending) && (
            <div className="absolute top-[40%] h-6 w-full text-center">
              <DotLoader className="" />
              <p className="p-2 text-center text-xs text-primary">
                {isFetching
                  ? t("v-gen:info.video_on_create")
                  : ExtendVideoMutation.variables?.extendType === "audio"
                    ? t("v-gen:info.video_on_audio")
                    : t("v-gen:info.video_on_extend")}
              </p>
            </div>
          )}

          {createVideoError ? (
            <ErrorRenderer info={createVideoError} />
          ) : (
            <div className="min-h-40 w-full">
              {taskData.result ? (
                <VideoPlayer url={taskData.result.videoUrl} />
              ) : frameImageUrl ? (
                <Image
                  src={frameImageUrl}
                  width={200}
                  height={50}
                  className="h-auto w-full opacity-20"
                  alt="Video frame image"
                />
              ) : (
                <div className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-md bg-slate-50 dark:bg-slate-900"></div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          if (!open) handleDialogClose();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="mb-4 text-lg font-medium">
              {extensionType === "ratio"
                ? t("v-gen:dialog.extend_ratio.title")
                : extensionType === "style"
                  ? t("v-gen:dialog.extend_style.title")
                  : extensionType === "audio"
                    ? t("v-gen:dialog.extend_audio.title")
                    : t("v-gen:dialog.extend_upscale.title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {extensionType === "ratio"
                ? t("v-gen:dialog.extend_ratio.description")
                : extensionType === "style"
                  ? t("v-gen:dialog.extend_style.description")
                  : extensionType === "audio"
                    ? t("v-gen:dialog.extend_audio.description")
                    : t("v-gen:dialog.extend_upscale.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {extensionType !== "upscale" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {extensionType === "ratio"
                    ? t("v-gen:dialog.video_content")
                    : extensionType === "audio"
                      ? t("v-gen:dialog.audio_content")
                      : t("v-gen:dialog.video_content_style")}
                </label>
                <input
                  type="text"
                  value={extensionPrompt}
                  onChange={(e) => setExtensionPrompt(e.target.value)}
                  className="w-full rounded-md border px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={
                    extensionType === "ratio"
                      ? t("v-gen:dialog.video_content_placeholder")
                      : extensionType === "audio"
                        ? t("v-gen:dialog.audio_content_placeholder")
                        : t("v-gen:dialog.video_content_style_placeholder")
                  }
                />
              </div>
            )}

            {extensionType === "style" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("v-gen:dialog.duration")}
                </label>
                <Select
                  value={selectedSeconds.toString()}
                  onValueChange={(value) => setSelectedSeconds(parseInt(value))}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue
                      placeholder={t("v-gen:dialog.select_duration")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">
                      5{t("v-gen:dialog.seconds")}
                    </SelectItem>
                    <SelectItem value="10">
                      10{t("v-gen:dialog.seconds")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {extensionType === "ratio" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("v-gen:dialog.video_ratio")}
                </label>
                <div className="flex gap-4">
                  <Button
                    className={cn(
                      "h-9 flex-1",
                      selectedRatio === "5:3"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : ""
                    )}
                    variant={selectedRatio === "5:3" ? "default" : "outline"}
                    onClick={() => setSelectedRatio("5:3")}
                  >
                    {t("v-gen:dialog.extend_ratio.horizontal_screen")}
                  </Button>
                  <Button
                    className={cn(
                      "h-9 flex-1",
                      selectedRatio === "3:5"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : ""
                    )}
                    variant={selectedRatio === "3:5" ? "default" : "outline"}
                    onClick={() => setSelectedRatio("3:5")}
                  >
                    {t("v-gen:dialog.extend_ratio.vertical_screen")}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 border-t pt-4">
              <Button
                variant="secondary"
                onClick={handleDialogClose}
                className="h-9"
              >
                {t("v-gen:dialog.cancel")}
              </Button>
              <Button
                variant="default"
                onClick={handleSubmit}
                className="h-9"
                disabled={ExtendVideoMutation.isPending}
              >
                {ExtendVideoMutation.isPending ? (
                  <DotLoader className="mr-2" />
                ) : null}
                {t("v-gen:dialog.submit")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TaskItem;
