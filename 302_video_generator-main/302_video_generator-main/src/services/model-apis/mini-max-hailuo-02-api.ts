/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "@/lib/api";
import { useTaskStore } from "@/stores";

export interface MiniMaxHailuo02Data {
  taskId: string;
  minimaxiHailuoPrompt: string;
  minimaxiHailuoPromptOptimizer: boolean;
  minimaxiHailuoDuration: string;
  minimaxiHailuoResolution: string;
  minimaxiHailuoFirstFrameImage: string;
}

const MINI_MAX_HAILOU_02_URL = "minimaxi/v1/video_generation";
const MINI_MAX_HAILOU_02_QUERY_URL = "minimaxi/v1/query/video_generation";
const MINI_MAX_HAILOU_02_FILE_URL = "minimaxi/v1/files/retrieve";

export async function getMiniMaxHailuo02Video(schema: MiniMaxHailuo02Data) {
  const {
    taskId,
    minimaxiHailuoPrompt,
    minimaxiHailuoPromptOptimizer,
    minimaxiHailuoDuration,
    minimaxiHailuoResolution,
    minimaxiHailuoFirstFrameImage,
  } = schema;

  const createTask = async (
    data: {
      prompt: string;
      prompt_optimizer: boolean;
      duration: number;
      resolution: string;
      first_frame_image?: string;
    },
    url: string
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        let result: any = {};
        const res = await apiFetch(url, {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json", // 添加 Content-Type header
          },
        });
        if (!res.ok) {
          throw await res.json();
        }
        result = await res.json();
        console.debug("MiniMax Hailuo 02 result", result);
        result = await fetchMiniMaxHailuo02Task(taskId, result.task_id);
        console.debug("MiniMax Hailuo 02 final result", result);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  };

  const data = {
    model: "MiniMax-Hailuo-02",
    prompt: minimaxiHailuoPrompt,
    prompt_optimizer: minimaxiHailuoPromptOptimizer,
    duration: Number(minimaxiHailuoDuration),
    resolution: minimaxiHailuoResolution,
    ...(minimaxiHailuoFirstFrameImage && {
      first_frame_image: minimaxiHailuoFirstFrameImage,
    }),
  };

  return await createTask(data, MINI_MAX_HAILOU_02_URL);
}

const fetchMiniMaxHailuo02Task = async (taskId: string, resultId: string) => {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`${MINI_MAX_HAILOU_02_QUERY_URL}?task_id=${resultId}`, {
        headers: {},
      })
        .then((response) => response.json())
        .then(async (data) => {
          if (data.error) {
            reject(data.error);
            return;
          }
          if (data.file_id) {
            const url = await fetchMinimaxFile(resultId, data.file_id);
            resolve({ output: url });
          } else if (data.status === "Fail") {
            reject(data.base_resp.status_msg);
          } else if (data.code === "task_not_exist") {
            reject("Task not exist");
          } else {
            if (counter < maxAttempts) {
              counter++;
              const { getTask } = useTaskStore.getState();
              const task = getTask(taskId);
              if (task) {
                setTimeout(() => polling(taskId, resultId), 10000); // 每隔10秒轮询一次
              }
            } else {
              reject("Max attempts reached");
            }
          }
        })
        .catch((error) => {
          reject(error);
        });
    };
    polling(taskId, resultId);
  });
};

async function fetchMinimaxFile(resultId: string, fileId: string) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxRetries = 3;

    const polling = (fileId: string) => {
      apiFetch(
        `${MINI_MAX_HAILOU_02_FILE_URL}?file_id=${fileId}&task_id=${resultId}`,
        {
          headers: {},
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            if (attempts < maxRetries) {
              attempts++;
              setTimeout(() => polling(fileId), 1000); // 失败后1秒后重试
            } else {
              reject(data.error);
            }
            return;
          }
          if (data.file) {
            resolve(data.file.download_url);
          } else {
            reject("Get Minimax File Error");
          }
        })
        .catch((error) => {
          if (attempts < maxRetries) {
            attempts++;
            setTimeout(() => polling(fileId), 1000); // 失败后1秒后重试
          } else {
            reject(error);
          }
        });
    };
    polling(fileId);
  });
}
