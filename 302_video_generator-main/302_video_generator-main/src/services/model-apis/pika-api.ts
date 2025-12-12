/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "@/lib/api";
import { useTaskStore } from "@/stores";

export interface PikaData {
  taskId: string;
  pikaImage: string;
  pikaPrompt: string;
  pikaNegativePrompt: string;
  pikaAffects: string;
}

const Pika_URL = "pika/generate/pikaffects";

export async function getPikaVideo(schema: PikaData) {
  const { taskId, pikaImage, pikaPrompt, pikaNegativePrompt, pikaAffects } =
    schema;

  const createTask = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        // Create FormData for multipart/form-data
        const formData = new FormData();

        // Convert image URL to file
        const response = await fetch(pikaImage);
        const blob = await response.blob();
        const imageFile = new File([blob], "image.png", { type: blob.type });
        formData.append("image", imageFile);

        // Add required fields
        formData.append("promptText", pikaPrompt);
        formData.append("negativePrompt", pikaNegativePrompt || "");
        formData.append("seed", "12345");
        formData.append("pikaffect", pikaAffects);

        const res = await apiFetch(Pika_URL, {
          method: "POST",
          body: formData,
          // Don't set Content-Type header - let browser set it for FormData
        });

        if (!res.ok) {
          throw await res.json();
        }

        const result = await res.json();
        console.debug("Pika result", result);

        const finalResult = await fetchPikaTask(taskId, result.video_id);
        console.debug("Pika final result", finalResult);

        resolve({ output: finalResult.url, id: result.video_id });
      } catch (error) {
        reject(error);
      }
    });
  };

  return await createTask();
}

async function fetchPikaTask(
  taskId: string,
  resultId: string
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`pika/task/${resultId}/fetch`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Pika task result", data);
          if (data.status === "finished") {
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
}
