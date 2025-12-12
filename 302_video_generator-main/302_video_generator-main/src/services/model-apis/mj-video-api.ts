/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "@/lib/api";
import { useTaskStore } from "@/stores";

export interface MJVideoData {
  taskId: string;
  mjVideoPrompt: string;
  mjVideoMotion: string;
  mjVideoImage: string;
}

const MJ_VIDEO_URL = "mj/submit/video";
const MJ_FETCH_VIDEO_URL = "mj/task/{id}/fetch";

export async function getMJVideo(schema: MJVideoData) {
  const { taskId, mjVideoPrompt, mjVideoMotion, mjVideoImage } = schema;

  const createTask = async (
    data: {
      prompt: string;
      motion: string;
      image: string;
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
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw await res.json();
        }
        result = await res.json();
        console.debug("MJ Video result", result);
        result = await fetchMJVideoTask(taskId, result.result);
        console.debug("MJ Video final result", result);
        resolve({
          output: result.videoUrls.map((url: { url: string }) => url.url),
          id: result.result,
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  const data = {
    prompt: mjVideoPrompt,
    motion: mjVideoMotion,
    image: mjVideoImage,
  };

  return await createTask(data, MJ_VIDEO_URL);
}

const fetchMJVideoTask = async (taskId: string, resultId: string) => {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`${MJ_FETCH_VIDEO_URL.replace("{id}", resultId)}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("MJ Video task result", data);
          if (data.status === "SUCCESS") {
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
