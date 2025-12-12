/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "@/lib/api";
import { useTaskStore } from "@/stores";

export interface Veo3ProFramesData {
  taskId: string;
  veo3ProFramesPrompt: string;
  veo3ProFramesImage: string;
}

const VEO3_PRO_FRAMES_URL = "302/submit/veo3-pro-frames";

export async function getVeo3ProFramesVideo(schema: Veo3ProFramesData) {
  const { taskId, veo3ProFramesPrompt, veo3ProFramesImage } = schema;

  const createTask = async (
    data: {
      text_prompt: string;
      input_image: string;
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
        console.debug("Veo 3 Pro Frames result", result);
        result = await fetchVeo3ProFramesTask(taskId, result.task_id);
        console.debug("Veo 3 Pro Frames final result", result);
        resolve({ output: result.video_url, id: result.task_id });
      } catch (error) {
        reject(error);
      }
    });
  };

  const data = {
    text_prompt: veo3ProFramesPrompt,
    input_image: veo3ProFramesImage,
  };

  return await createTask(data, VEO3_PRO_FRAMES_URL);
}

const fetchVeo3ProFramesTask = async (taskId: string, resultId: string) => {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`${VEO3_PRO_FRAMES_URL}?request_id=${resultId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Veo 3 task result", data);
          if (data.status === "completed") {
            resolve(data);
          } else if (data.status === "failed") {
            reject("Fetch task failed");
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
