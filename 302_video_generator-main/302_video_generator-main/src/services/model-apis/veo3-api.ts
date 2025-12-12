/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "@/lib/api";
import { useTaskStore } from "@/stores";

export interface Veo3Data {
  taskId: string;
  veo3Prompt: string;
  veo3AspectRatio: string;
  veo3EnhancePrompt: boolean;
  veo3GenerateAudio: boolean;
}

const VEO3_URL = "302/submit/veo3";
// 视频: Veo 3
export async function getVeo3Video(schema: Veo3Data) {
  const {
    taskId,
    veo3Prompt,
    veo3AspectRatio,
    veo3EnhancePrompt,
    veo3GenerateAudio,
  } = schema;

  // 添加验证
  if (!veo3Prompt || veo3Prompt.trim() === "") {
    throw new Error("veo3Prompt is required and cannot be empty");
  }

  const createTask = async (
    data: {
      prompt: string;
      aspect_ratio: string;
      enhance_prompt: boolean;
      generate_audio: boolean;
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
        console.debug("Veo 3 result", result);
        result = await fetchVeo3Task(taskId, result.request_id);
        console.debug("Veo 3 final result", result);
        resolve({ output: result.video.url, id: result.request_id });
      } catch (error) {
        reject(error);
      }
    });
  };

  const data = {
    prompt: veo3Prompt.trim(),
    aspect_ratio: veo3AspectRatio,
    enhance_prompt: veo3EnhancePrompt,
    generate_audio: veo3GenerateAudio,
  };

  return await createTask(data, VEO3_URL);
}

const fetchVeo3Task = async (taskId: string, resultId: string) => {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`${VEO3_URL}?request_id=${resultId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Veo 3 task result", data);
          if (data.status === "COMPLETED") {
            resolve(data);
          } else if (data.status === "FAILED") {
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
