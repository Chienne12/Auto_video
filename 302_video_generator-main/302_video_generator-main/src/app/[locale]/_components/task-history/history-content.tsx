"use client";

import dayjs from "dayjs";
import { Download, Trash2 } from "lucide-react";

import VideoPlayer from "@/components/common/video-player";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClientTranslation } from "@/hooks/global";
import { useVideoHistory } from "@/hooks/v-gen/use-video-history";
import FileManager from "@/lib/file";
import { useHistoryStore } from "@/stores";
import { HistoryType } from "@/stores/slices/history-slice";

export function HistoryContent() {
  const { t } = useClientTranslation();
  const clearHistorysByType = useHistoryStore(
    (state) => state.clearHistorysByType
  );
  const videoHistory = useVideoHistory();

  if (videoHistory.isEmpty) return <>{t("global:history.empty")}</>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="left flex-1 text-sm text-slate-500">
          {t("global:history.total", {
            count: videoHistory.allHistorys.length,
          })}
        </div>
        <div className="">
          <Button
            size={"icon"}
            variant="outline"
            className="hover:border-red-500 hover:text-red-500"
            onClick={() => clearHistorysByType(HistoryType.VIDEO_GENERATION)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <ScrollArea className="mt-2 h-[300px] w-full rounded-md border p-4 md:h-[500px]">
        <ul className="space-y-4 text-sm">
          {videoHistory.allHistorys.reverse().map((history) => {
            return (
              <li key={history.id}>
                <div className="flex w-full flex-col items-center space-y-2 rounded-md bg-slate-200 p-4 dark:bg-slate-900">
                  <div className="flex w-full items-start justify-between space-x-2">
                    <div className="flex w-full flex-col">
                      <div className="h-[20px] text-base font-medium text-primary">
                        {t(
                          `v-gen:form.model.option.${history.payload.payload.model}`
                        )}
                      </div>
                      <div className="text-xs italic text-slate-500">
                        {dayjs(history.payload.timestamp).format(
                          "YYYY-MM-DD hh:mm:ss"
                        )}
                      </div>
                    </div>
                    {history.payload.result.videoUrl && (
                      <Button
                        size={"icon"}
                        onClick={() =>
                          FileManager.downloadVideo(
                            history.payload.result.videoUrl
                          )
                        }
                      >
                        <Download size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <VideoPlayer url={history.payload.result?.videoUrl} />
                  </div>

                  {history.payload.prompt && (
                    <div className="w-full text-xs text-slate-400">
                      {history.payload.prompt}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}
