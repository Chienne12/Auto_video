/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "@/lib/api";
import { useTaskStore } from "@/stores";

const KLING21_COMMON_IMAGE_TO_VIDEO_5S_URL = "klingai/m2v_21_img2video";
const KLING21_COMMON_IMAGE_TO_VIDEO_10S_URL = "klingai/m2v_21_img2video_10s";

const KLING21_HQ_IMAGE_TO_VIDEO_5S_URL = "klingai/m2v_21_img2video_hq";
const KLING21_HQ_IMAGE_TO_VIDEO_10S_URL = "klingai/m2v_21_img2video_hq_10s";

const KLING21_MASTER_TEXT_TO_VIDEO_5S_URL =
  "klingai/m2v_21_master_txt2video_5s";
const KLING21_MASTER_TEXT_TO_VIDEO_10S_URL =
  "klingai/m2v_21_master_txt2video_10s";
const KLING21_MASTER_IMAGE_TO_VIDEO_5S_URL =
  "klingai/m2v_21_master_img2video_5s";
const KLING21_MASTER_IMAGE_TO_VIDEO_10S_URL =
  "klingai/m2v_21_master_img2video_10s";

export interface Kling21Data {
  taskId: string;
  klingV21Type: string;
  klingV21Version: string;
  klingV21Image: string;
  klingV21Prompt: string;
  klingV21NegativePrompt: string;
  klingV21Cfg: number;
  klingV21AspectRatio: string;
  klingV21Duration: string;
}

export async function getKling21Video(schema: Kling21Data) {
  const {
    taskId,
    klingV21Type,
    klingV21Version,
    klingV21Image,
    klingV21Prompt,
    klingV21NegativePrompt,
    klingV21Cfg,
    klingV21AspectRatio,
    klingV21Duration,
  } = schema;

  const createTask = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        let result: any = {};
        // Create FormData for multipart/form-data
        const formData = new FormData();

        if (klingV21Type === "image_to_video") {
          const response = await fetch(klingV21Image);
          const blob = await response.blob();
          const imageFile = new File([blob], "image.png", { type: blob.type });
          formData.append("input_image", imageFile);
        }

        // Add required fields
        formData.append("prompt", klingV21Prompt);
        formData.append("negative_prompt", klingV21NegativePrompt || "");
        formData.append("cfg", klingV21Cfg.toString());
        formData.append("aspect_ratio", klingV21AspectRatio);

        const url = (() => {
          if (klingV21Version === "master") {
            if (klingV21Type === "image_to_video") {
              return klingV21Duration === "5"
                ? KLING21_MASTER_IMAGE_TO_VIDEO_5S_URL
                : KLING21_MASTER_IMAGE_TO_VIDEO_10S_URL;
            } else {
              // text_to_video
              return klingV21Duration === "5"
                ? KLING21_MASTER_TEXT_TO_VIDEO_5S_URL
                : KLING21_MASTER_TEXT_TO_VIDEO_10S_URL;
            }
          } else if (klingV21Version === "hq") {
            // HQ version only supports image_to_video
            return klingV21Duration === "5"
              ? KLING21_HQ_IMAGE_TO_VIDEO_5S_URL
              : KLING21_HQ_IMAGE_TO_VIDEO_10S_URL;
          } else {
            // common version only supports image_to_video
            return klingV21Duration === "5"
              ? KLING21_COMMON_IMAGE_TO_VIDEO_5S_URL
              : KLING21_COMMON_IMAGE_TO_VIDEO_10S_URL;
          }
        })();

        const res = await apiFetch(url, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw await res.json();
        }

        result = await res.json();
        console.debug("Kling21 result", result);
        result = await fetchKling21Task(taskId, result.data.task.id);
        console.debug("Kling21 final result", result);
        resolve({ output: result.video, id: result.id });
      } catch (error) {
        reject(error);
      }
    });
  };

  return await createTask();
}

const fetchKling21Task = async (taskId: string, resultId: string) => {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(
        `klingai/task/${resultId}/fetch
      `,
        {
          headers: {},
        }
      )
        .then((response) => response.json())
        .then((data) => {
          const video = data.data.works[0]?.resource.resource;
          const id = data.data.task.id;
          if (video) {
            resolve({ video, id });
          } else if (data.data.status === 50) {
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
