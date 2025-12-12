/* eslint-disable @typescript-eslint/no-explicit-any */
// Define the TaskResult interface
import { apiFetch } from "@/lib/api";
import { isEnglish } from "@/lib/utils";
import { useTaskStore } from "@/stores";
import type { Task, TaskResult } from "@/stores/slices/task-slice";

import { aiImageToText, aiTranslate } from "./global";
import { Kling21Data, getKling21Video } from "./model-apis/kling21-api";
import {
  MiniMaxHailuo02Data,
  getMiniMaxHailuo02Video,
} from "./model-apis/mini-max-hailuo-02-api";
import { MJVideoData, getMJVideo } from "./model-apis/mj-video-api";
import { PikaData, getPikaVideo } from "./model-apis/pika-api";
import { Veo3Data, getVeo3Video } from "./model-apis/veo3-api";
import { Veo3FastData, getVeo3FastVideo } from "./model-apis/veo3-fast-api";
import { Veo3ProData, getVeo3ProVideo } from "./model-apis/veo3-pro-api";
import {
  Veo3ProFramesData,
  getVeo3ProFramesVideo,
} from "./model-apis/veo3-pro-frames-api";

interface HiggsfieldData {
  taskId: string;
  higgsfieldMix: boolean;
  higgsfieldMotion1: string;
  higgsfieldMotion2: string;
  higgsfieldMotionStrength1: number;
  higgsfieldMotionStrength2: number;
  higgsfieldStartFrame: string;
  higgsfieldEndFrame: string;
  higgsfieldPrompt: string;
  higgsfieldModel: string;
  higgsfieldTime: string;
}

interface ViduV2Data {
  taskId: string;
  viduV2Model: string;
  viduV2Type: string;
  viduV2Prompt: string;
  viduV2Image: string;
  viduV2StartFrame: string;
  viduV2EndFrame: string;
  viduV2ReferenceImage1: string;
  viduV2ReferenceImage2: string;
  viduV2ReferenceImage3: string;
  viduV2Duration: string;
  viduV2Resolution: string;
  viduV2Scene: string;
  viduV2MovementAmplitude: string;
  viduV2AspectRatio: string;
  viduV2Style: string;
}

interface KlingV2Data {
  taskId: string;
  klingV2Type: string;
  klingV2Image: string;
  klingV2Prompt: string;
  klingV2NegativePrompt: string;
  klingV2Cfg: number;
  klingV2AspectRatio: string;
  klingV2Duration: string;
}

interface SeedanceData {
  taskId: string;
  seedanceType: string;
  seedanceModel: string;
  seedanceText: string;
  seedanceReslution: string;
  seedanceRatio: string;
  seedanceWm: string;
  seedanceCf: string;
  seedanceImage: string;
  seedanceDuration: string;
}

// Generate Video Fetch
export const generateVideo = async (task: Task): Promise<TaskResult> => {
  const taskId = task.id;
  try {
    const {
      model,
      prompt = "",
      firstFrame = "",
      lastFrame = "",
      thirdFrame = "",
      referenceImage1 = "",
      referenceImage2 = "",
      referenceImage3 = "",
      referenceImage4 = "",
      ratio = "",
      type = "",
      time = "",
      loop = "",
      camera = "",
      audio = "",
      // style = "",
      template = "",
      viduType = "",
      viduStyle = "",
      viduTime = "",
      viduResolution = "",
      viduScene = "",
      // higgsfield
      higgsfieldMix = false,
      higgsfieldMotion1 = "",
      higgsfieldMotion2 = "",
      higgsfieldMotionStrength1 = 0.85,
      higgsfieldMotionStrength2 = 0.85,
      higgsfieldStartFrame = null,
      higgsfieldEndFrame = null,
      higgsfieldPrompt = "",
      higgsfieldModel = "",
      higgsfieldTime = "3s",
      // vidu v2
      viduV2Model = "",
      viduV2Type = "",
      viduV2Prompt = "",
      viduV2Image = null,
      viduV2StartFrame = null,
      viduV2EndFrame = null,
      viduV2ReferenceImage1 = null,
      viduV2ReferenceImage2 = null,
      viduV2ReferenceImage3 = null,
      viduV2Duration = "",
      viduV2Resolution = "",
      viduV2Scene = "",
      viduV2MovementAmplitude = "",
      viduV2AspectRatio = ":9",
      viduV2Style = "",
      // kling v2
      klingV2Type = "",
      klingV2Image = null,
      klingV2Prompt = "",
      klingV2NegativePrompt = "",
      klingV2Cfg = 0.5,
      klingV2AspectRatio = "",
      klingV2Duration = "",
      // veo 3
      veo3Prompt = "",
      veo3AspectRatio = "",
      veo3EnhancePrompt = true,
      veo3GenerateAudio = true,
      // Seedance
      seedanceType = "",
      seedanceText = "",
      seedanceModel = "",
      seedanceReslution = "",
      seedanceRatio = "",
      seedanceWm = "",
      seedanceCf = "",
      seedanceImage = null,
      seedanceDuration = "",
    } = task.payload;

    // init reference image list
    const imageList: string[] = [];
    if (referenceImage1) imageList.push(referenceImage1);
    if (referenceImage2) imageList.push(referenceImage2);
    if (referenceImage3) imageList.push(referenceImage3);
    if (referenceImage4) imageList.push(referenceImage4);

    // Translate prompt if not in English
    const translatedPrompt = async () =>
      prompt && !isEnglish(prompt) ? await aiTranslate(prompt) : prompt;

    // Extract image description by uploading and processing the frame
    const getUploadedImagePrompt = async (url: string) => {
      return await aiImageToText(url);
    };

    // Derive the video prompt based on available files
    let videoPrompt = prompt;
    if (
      ![
        "pixverse",
        "seaweed",
        "higgsfield",
        "vidu_2",
        "kling_2",
        "veo3",
        "veo3_pro_frames",
        "veo3_pro",
        "veo3_fast",
        "seedance",
        "minimaxi_hailuo_02",
        "mj_video",
        "pika",
        "kling_21",
      ].includes(model)
    ) {
      videoPrompt = prompt
        ? await translatedPrompt()
        : firstFrame
          ? await getUploadedImagePrompt(firstFrame)
          : await getUploadedImagePrompt(lastFrame);
    }

    // Process video creation based on the specified model
    const createVideo = async () => {
      switch (model) {
        case "kling_21": {
          const schema: Kling21Data = {
            taskId,
            klingV21Type: task.payload.klingV21Type,
            klingV21Version: task.payload.klingV21Version,
            klingV21Image: task.payload.klingV21Image,
            klingV21Prompt: task.payload.klingV21Prompt,
            klingV21NegativePrompt: task.payload.klingV21NegativePrompt,
            klingV21Cfg: task.payload.klingV21Cfg,
            klingV21AspectRatio: task.payload.klingV21AspectRatio,
            klingV21Duration: task.payload.klingV21Duration,
          };
          return await getKling21Video(schema);
        }
        case "mj_video": {
          const schema: MJVideoData = {
            taskId,
            mjVideoPrompt: task.payload.mjVideoPrompt,
            mjVideoMotion: task.payload.mjVideoMotion,
            mjVideoImage: task.payload.mjVideoImage,
          };
          return await getMJVideo(schema);
        }
        case "veo3_pro": {
          let veo3ProPromptValue = task.payload.veo3ProPrompt;
          if (!isEnglish(veo3ProPromptValue)) {
            veo3ProPromptValue = await aiTranslate(veo3ProPromptValue);
          }
          const schema: Veo3ProData = {
            taskId,
            veo3ProPrompt: veo3ProPromptValue,
          };
          console.log("veo3ProPromptValue:::", veo3ProPromptValue);
          return await getVeo3ProVideo(schema);
        }
        case "veo3_pro_frames": {
          let veo3ProFramesPromptValue = task.payload.veo3ProFramesPrompt;
          if (!isEnglish(veo3ProFramesPromptValue)) {
            veo3ProFramesPromptValue = await aiTranslate(
              veo3ProFramesPromptValue
            );
          }
          const schema: Veo3ProFramesData = {
            taskId,
            veo3ProFramesPrompt: veo3ProFramesPromptValue,
            veo3ProFramesImage: task.payload.veo3ProFramesImage,
          };
          console.log("veo3ProFramesPromptValue:::", veo3ProFramesPromptValue);
          return await getVeo3ProFramesVideo(schema);
        }
        case "veo3_fast": {
          let veo3FastPromptValue = task.payload.veo3FastPrompt;
          if (!isEnglish(veo3FastPromptValue)) {
            veo3FastPromptValue = await aiTranslate(veo3FastPromptValue);
          }
          const schema: Veo3FastData = {
            taskId,
            veo3FastPrompt: veo3FastPromptValue,
          };
          console.log("veo3FastPromptValue:::", veo3FastPromptValue);
          return await getVeo3FastVideo(schema);
        }
        case "minimaxi_hailuo_02": {
          let minimaxiHailuoPromptValue = task.payload.minimaxiHailuoPrompt;
          if (!isEnglish(minimaxiHailuoPromptValue)) {
            minimaxiHailuoPromptValue = await aiTranslate(
              minimaxiHailuoPromptValue
            );
          }
          const schema: MiniMaxHailuo02Data = {
            taskId,
            minimaxiHailuoPrompt: minimaxiHailuoPromptValue,
            minimaxiHailuoPromptOptimizer:
              task.payload.minimaxiHailuoPromptOptimizer,
            minimaxiHailuoDuration: task.payload.minimaxiHailuoDuration,
            minimaxiHailuoResolution: task.payload.minimaxiHailuoResolution,
            minimaxiHailuoFirstFrameImage:
              task.payload.minimaxiHailuoFirstFrameImage,
          };
          return await getMiniMaxHailuo02Video(schema);
        }
        case "seedance": {
          const schema: SeedanceData = {
            taskId,
            seedanceType,
            seedanceModel,
            seedanceText,
            seedanceReslution,
            seedanceRatio,
            seedanceWm,
            seedanceCf,
            seedanceImage,
            seedanceDuration,
          };
          return await getSeedanceVideo(schema);
        }
        case "veo3": {
          let veo3PromptValue = veo3Prompt;
          if (!isEnglish(veo3Prompt)) {
            veo3PromptValue = await aiTranslate(veo3Prompt);
          }
          const schema: Veo3Data = {
            taskId,
            veo3Prompt: veo3PromptValue,
            veo3AspectRatio,
            veo3EnhancePrompt,
            veo3GenerateAudio,
          };
          return await getVeo3Video(schema);
        }
        case "kling_2": {
          const schema: KlingV2Data = {
            taskId,
            klingV2Type,
            klingV2Image,
            klingV2Prompt,
            klingV2NegativePrompt,
            klingV2Cfg,
            klingV2AspectRatio,
            klingV2Duration,
          };
          return await getKlingV2Video(schema);
        }
        case "vidu_2": {
          const schema: ViduV2Data = {
            taskId,
            viduV2Model,
            viduV2Type,
            viduV2Prompt,
            viduV2Image,
            viduV2StartFrame,
            viduV2EndFrame,
            viduV2ReferenceImage1,
            viduV2ReferenceImage2,
            viduV2ReferenceImage3,
            viduV2Duration,
            viduV2Resolution,
            viduV2Scene,
            viduV2MovementAmplitude,
            viduV2AspectRatio,
            viduV2Style,
          };
          return await getViduV2Video(schema);
        }
        case "higgsfield": {
          const schema: HiggsfieldData = {
            taskId,
            higgsfieldMix,
            higgsfieldMotion1,
            higgsfieldMotion2,
            higgsfieldMotionStrength1,
            higgsfieldMotionStrength2,
            higgsfieldStartFrame,
            higgsfieldEndFrame,
            higgsfieldPrompt,
            higgsfieldModel,
            higgsfieldTime,
          };
          return await getHiggsfieldVideo(schema);
        }

        case "luma":
          return await getLumaVideo(
            taskId,
            camera !== "none" ? `${camera} ${videoPrompt}` : videoPrompt,
            firstFrame,
            lastFrame,
            loop
          );

        case "kling_15":
          return await getKlingVideo(
            taskId,
            videoPrompt,
            firstFrame,
            lastFrame,
            ratio,
            type,
            time,
            "15",
            imageList
          );

        case "kling":
          return await getKlingVideo(
            taskId,
            videoPrompt,
            firstFrame,
            lastFrame,
            ratio,
            type,
            time,
            "16",
            imageList
          );

        case "runway":
          return await getRunwayVideo(
            taskId,
            videoPrompt,
            firstFrame,
            lastFrame,
            time.replace("s", ""),
            type
          );

        case "cog":
          return await getCogVideo(
            taskId,
            videoPrompt,
            firstFrame,
            type,
            audio,
            time,
            ratio
          );

        case "minimax":
          return await getMinimaxVideo(
            taskId,
            "video-01",
            videoPrompt.slice(0, 200),
            firstFrame
          );

        case "minimax_live2d":
          return await getMinimaxVideo(
            taskId,
            "video-01-live2d",
            videoPrompt.slice(0, 200),
            firstFrame
          );

        case "minimax_s2v01":
          return await getMinimaxVideo(
            taskId,
            "S2V-01",
            videoPrompt.slice(0, 200),
            firstFrame
          );

        case "pika": {
          const schema: PikaData = {
            taskId,
            pikaImage: task.payload.pikaImage,
            pikaPrompt: task.payload.pikaPrompt,
            pikaNegativePrompt: task.payload.pikaNegativePrompt,
            pikaAffects: task.payload.pikaAffects,
          };
          return await getPikaVideo(schema);
        }

        case "genmo":
          return await getGenmoVideo(taskId, await translatedPrompt());

        case "haiper":
          return await getHaiperVideo(taskId, videoPrompt, firstFrame);

        case "pixverse":
          return await getPixverseVideo(
            taskId,
            videoPrompt,
            firstFrame,
            template
          );

        case "lightricks":
          return await getLightricksVideo(taskId, videoPrompt, firstFrame);

        case "hunyuan":
          return await getHunyuanVideo(taskId, videoPrompt);

        case "wanx_turbo":
          return await getWanxVideo(
            taskId,
            "wanx2.1-t2v-turbo",
            videoPrompt,
            ratio
          );
        case "wanx_plus":
          return await getWanxVideo(
            taskId,
            "wanx2.1-t2v-plus",
            videoPrompt,
            ratio
          );

        case "vidu": {
          let mergeFrame = null;
          if (firstFrame && lastFrame && viduType === "scene") {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            const imageToCanvas = async (
              image: File
            ): Promise<HTMLCanvasElement> => {
              const url = URL.createObjectURL(image);
              const img = new Image();
              img.src = url;
              // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
              await new Promise((resolve) => (img.onload = resolve));
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
              ctx.drawImage(img, 0, 0);
              return canvas;
            };

            const firstFrameImage = await imageToCanvas(firstFrame);
            const lastFrameImage = await imageToCanvas(lastFrame);
            canvas.width = firstFrameImage.width + lastFrameImage.width;
            canvas.height = Math.max(
              firstFrameImage.height,
              lastFrameImage.height
            );
            ctx.drawImage(firstFrameImage, 0, 0);
            ctx.drawImage(lastFrameImage, firstFrameImage.width, 0);
            mergeFrame = new File(
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
              [await new Promise((resolve) => canvas.toBlob(resolve as any))],
              "merged.png",
              {
                type: "image/png",
              }
            );
          }
          return await getViduVideo(
            taskId,
            prompt,
            videoPrompt,
            mergeFrame || firstFrame,
            firstFrame,
            lastFrame,
            thirdFrame,
            ratio,
            viduType,
            viduStyle,
            viduTime,
            viduResolution,
            viduScene
          );
        }
        case "seaweed":
          return await getSeaweedVideo(taskId, videoPrompt, firstFrame, ratio);
        default:
          throw new Error("Unknown model");
      }
    };

    const res = await createVideo();

    if (res.output && Array.isArray(res.output)) {
      return {
        resultId: res.id || "",
        videoUrls: res.output,
      };
    }

    // Validate and return result
    return res.output
      ? { resultId: res.id || "", videoUrl: res.output }
      : Promise.reject("Create video error: missing video");
  } catch (error) {
    return Promise.reject(error);
  }
};

// Extend Video
export const extendVideo = async (task: Task): Promise<TaskResult> => {
  // return
  const {
    id: taskId,
    result,
    payload,
    extendType,
    extendPrompt,
    extendRatio,
    extendSeconds,
    structureTransformation,
  } = task;

  try {
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let res;

    if (extendType === "time") {
      const resultId = result?.resultId;
      if (!resultId) throw new Error("Extend Video Error: Missing result ID");
      const { model, prompt } = payload;

      switch (model) {
        case "luma":
          res = await extendLumaVideo(taskId, resultId, prompt);
          break;

        case "kling":
          res = await extendKlingVideo(taskId, resultId, prompt);
          break;

        default:
          throw new Error("Unsupported model for extension");
      }
    }

    if (extendType === "ratio") {
      const video = result?.videoUrl;
      if (!video)
        throw new Error("Extend Video Error: Missing origin video url");
      const enPrompt =
        extendPrompt && !isEnglish(extendPrompt)
          ? await aiTranslate(extendPrompt)
          : extendPrompt || "";
      res = await extendRunwayVideoRatio(
        taskId,
        video,
        enPrompt,
        extendRatio || "5:3",
        extendSeconds || 5
      );
    }

    if (extendType === "style") {
      const { prompt } = payload;
      const video = result?.videoUrl;
      if (!video)
        throw new Error("Extend Video Error: Missing origin video url");

      const stylePrompt = `${prompt}, ${extendPrompt}`;
      const enPrompt =
        stylePrompt && !isEnglish(stylePrompt)
          ? await aiTranslate(stylePrompt)
          : stylePrompt;
      res = await extendVideoStyle(
        taskId,
        video,
        structureTransformation || 0.9,
        enPrompt,
        extendSeconds || 5
      );
    }

    if (extendType === "upscale") {
      const resultId = result?.resultId;
      if (!resultId) throw new Error("Extend Video Error: Missing result ID");
      const { viduTime } = payload;
      res = await extendViduVideo(taskId, resultId, viduTime || 4);
    }

    if (extendType === "audio") {
      const { prompt } = payload;
      const video = result?.videoUrl;
      if (!video)
        throw new Error("Extend Video Error: Missing origin video url");

      const audioPrompt = extendPrompt || prompt;
      const enPrompt =
        audioPrompt && !isEnglish(audioPrompt)
          ? await aiTranslate(audioPrompt)
          : audioPrompt;
      res = await getMmaudioAudio(
        taskId,
        video,
        enPrompt
        // extendSeconds || 10
      );
    }

    return res.output
      ? { resultId: res.id || "", videoUrl: res.output }
      : Promise.reject("Extend video error: missing video");
  } catch (error) {
    return Promise.reject(error);
  }
};

const SEEDANCE_URL = "doubao/doubao-seedance";
export async function getSeedanceVideo(schema: SeedanceData) {
  const {
    taskId,
    seedanceType,
    seedanceModel,
    seedanceText,
    seedanceReslution,
    seedanceRatio,
    seedanceWm,
    seedanceCf,
    seedanceDuration,
    seedanceImage,
  } = schema;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const createTask = async (data: any, url: string) => {
    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
    return new Promise(async (resolve, reject) => {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
        console.debug("Seedance result", result);
        result = await fetchSeedanceTask(taskId, result.id);
        console.debug("Seedance final result", result);
        resolve({ output: result.content.video_url });
      } catch (error) {
        reject(error);
      }
    });
  };

  switch (seedanceType) {
    case "text_to_video": {
      const data = {
        model:
          seedanceModel === "pro"
            ? "doubao-seedance-1-0-pro-250528"
            : "doubao-seedance-1-0-lite-t2v-250428",
        content: [
          {
            type: "text",
            text: `${seedanceText} --resolution ${seedanceReslution} --seed -1 --ratio ${seedanceRatio} --wm ${seedanceWm} --cf ${seedanceCf} --fps 24 --dur ${seedanceDuration}`,
          },
        ],
      };

      return await createTask(data, SEEDANCE_URL);
    }
    case "image_to_video": {
      const data = {
        model:
          seedanceModel === "pro"
            ? "doubao-seedance-1-0-pro-250528"
            : "doubao-seedance-1-0-lite-i2v-250428",
        content: [
          {
            type: "text",
            text: `${seedanceText} --resolution ${seedanceReslution} --seed -1 --ratio adaptive --wm ${seedanceWm} --cf ${seedanceCf} --fps 24 --dur ${seedanceDuration}`,
          },
          {
            type: "image_url",
            image_url: { url: seedanceImage },
          },
        ],
      };
      return await createTask(data, SEEDANCE_URL);
    }
  }
}

export async function fetchSeedanceTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`doubao/doubao-seedance/${resultId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Seedance task result", data);
          if (data.status === "succeeded") {
            resolve(data);
          } else if (data.status === "failed") {
            reject("Fetch task failed");
          } else {
            if (counter < maxAttempts) {
              counter++;
              setTimeout(() => polling(taskId, resultId), 10000); // 每隔10秒轮询一次
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

const KLING_V2_TEXT_TO_VIDEO_URL = "klingai/m2v_20_txt2video_hq_5s";
const KLING_V2_IMAGE_TO_VIDEO_5S_URL = "klingai/m2v_20_img2video_hq_5s";
const KLING_V2_IMAGE_TO_VIDEO_10S_URL = "klingai/m2v_20_img2video_hq_10s";
// 视频: Kling V2
export async function getKlingV2Video(schema: KlingV2Data) {
  const {
    taskId,
    klingV2Type,
    klingV2Image,
    klingV2Prompt,
    klingV2NegativePrompt,
    klingV2Cfg,
    klingV2AspectRatio,
    klingV2Duration,
  } = schema;

  console.log("klingV2", schema);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const createTask = async (data: any, url: string) => {
    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
    return new Promise(async (resolve, reject) => {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
        console.debug("Kling V2 result", result);
        result = await fetchKlingTask(taskId, result.data.task.id);
        console.debug("Kling V2 final result", result);
        resolve({ output: result.video });
      } catch (error) {
        reject(error);
      }
    });
  };

  switch (klingV2Type) {
    case "text_to_video":
      return await createTask(
        {
          prompt: klingV2Prompt,
          negative_prompt: klingV2NegativePrompt,
          cfg: klingV2Cfg,
          aspect_ratio: klingV2AspectRatio,
        },
        KLING_V2_TEXT_TO_VIDEO_URL
      );
    case "image_to_video": {
      // 将imageURL
      if (klingV2Duration === "5") {
        return await createTask(
          {
            input_image: klingV2Image,
            prompt: klingV2Prompt,
            negative_prompt: klingV2NegativePrompt,
            cfg: klingV2Cfg,
            aspect_ratio: klingV2AspectRatio,
          },
          KLING_V2_IMAGE_TO_VIDEO_5S_URL
        );
      }
      if (klingV2Duration === "10") {
        return await createTask(
          {
            input_image: klingV2Image,
            prompt: klingV2Prompt,
            negative_prompt: klingV2NegativePrompt,
            cfg: klingV2Cfg,
            aspect_ratio: klingV2AspectRatio,
          },
          KLING_V2_IMAGE_TO_VIDEO_10S_URL
        );
      }
    }
  }
}

const IMAGE_TO_VIDEO_URL = "vidu/ent/v2/img2video";
const START_END_TO_VIDEO_URL = "vidu/ent/v2/start-end2video";
const REFERENCE_TO_VIDEO_URL = "vidu/ent/v2/reference2video";
const TEXT_TO_VIDEO_URL = "vidu/ent/v2/text2video";
// const SCENE_TO_VIDEO_URL = "vidu/ent/v2/template2video";
// 视频: Vidu V2
export async function getViduV2Video(schema: ViduV2Data) {
  const {
    taskId,
    viduV2Model,
    viduV2Type,
    viduV2Prompt,
    viduV2Image,
    viduV2StartFrame,
    viduV2EndFrame,
    viduV2ReferenceImage1,
    viduV2ReferenceImage2,
    viduV2ReferenceImage3,
    viduV2Duration,
    viduV2Resolution,
    viduV2MovementAmplitude,
    viduV2AspectRatio,
    viduV2Style,
  } = schema;

  const createTask = async (
    data: { model: string } & Partial<ViduV2Data>,
    url: string
  ) => {
    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
    return new Promise(async (resolve, reject) => {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
        console.debug("Vidu V2 result", result);
        result = await fetchViduV2Task(taskId, result.task_id);
        console.debug("Vidu V2 final result", result);
        resolve({ output: result.creations[0].url });
      } catch (error) {
        reject(error);
      }
    });
  };

  switch (viduV2Type) {
    case "image_to_video": {
      const data = {
        model: viduV2Model,
        images: [viduV2Image],
        prompt: viduV2Prompt,
        duration: Number.parseInt(viduV2Duration),
        resolution: viduV2Resolution,
        movement_amplitude: viduV2MovementAmplitude,
      };
      return await createTask(data, IMAGE_TO_VIDEO_URL);
    }
    case "head_tail_to_video": {
      const data = {
        model: viduV2Model,
        images: [viduV2StartFrame, viduV2EndFrame],
        prompt: viduV2Prompt,
        duration: Number.parseInt(viduV2Duration),
        resolution: viduV2Resolution,
        movement_amplitude: viduV2MovementAmplitude,
      };
      return await createTask(data, START_END_TO_VIDEO_URL);
    }
    case "character_to_video": {
      const data = {
        model: viduV2Model,
        images: [
          viduV2ReferenceImage1,
          viduV2ReferenceImage2,
          viduV2ReferenceImage3,
        ],
        prompt: viduV2Prompt,
        duration: Number.parseInt(viduV2Duration),
        aspect_ratio: viduV2AspectRatio,
        resolution: viduV2Resolution,
        movement_amplitude: viduV2MovementAmplitude,
      };
      return await createTask(data, REFERENCE_TO_VIDEO_URL);
    }
    case "text_to_video": {
      const data = {
        model: viduV2Model,
        prompt: viduV2Prompt,
        style: viduV2Style,
        duration: Number.parseInt(viduV2Duration),
        aspect_ratio: viduV2AspectRatio,
        resolution: viduV2Resolution,
        movement_amplitude: viduV2MovementAmplitude,
      };
      return await createTask(data, TEXT_TO_VIDEO_URL);
    }
  }
}

export async function fetchViduV2Task(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`vidu/ent/v2/tasks/${resultId}/creations`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.state === "success") {
            resolve(data);
          } else if (data.state === "failed") {
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

// 视频: Higgsfield
export async function getHiggsfieldVideo(
  schema: HiggsfieldData
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  const {
    taskId,
    higgsfieldMix,
    higgsfieldMotion1,
    higgsfieldMotion2,
    higgsfieldMotionStrength1,
    higgsfieldMotionStrength2,
    higgsfieldStartFrame,
    higgsfieldEndFrame,
    higgsfieldPrompt,
    higgsfieldModel,
    higgsfieldTime,
  } = schema;

  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      const data = {
        input_image: higgsfieldStartFrame,
        ...(higgsfieldEndFrame ? { input_image_end: higgsfieldEndFrame } : {}),
        model: higgsfieldModel,
        motions: higgsfieldMix
          ? [
              {
                motion_id: higgsfieldMotion1,
                strength: higgsfieldMotionStrength1,
              },
              {
                motion_id: higgsfieldMotion2,
                strength: higgsfieldMotionStrength2,
              },
            ]
          : [
              {
                motion_id: higgsfieldMotion1,
                strength: 1,
              },
            ],
        prompt: higgsfieldPrompt,
        seconds: Number.parseInt(higgsfieldTime),
      };

      console.debug("higgsfield data", data);

      const res = await apiFetch("higgsfield/image2video", {
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
      console.debug("higgsfield result", result);
      result = await fetchHiggsfieldTask(taskId, result.id);
      resolve({ output: result.result.url, id: result.id });
    } catch (error) {
      reject(error);
    }
  });
}

export async function fetchHiggsfieldTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`higgsfield/task/${resultId}/fetch`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
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
}

// 视频: Luma
export async function getLumaVideo(
  taskId: string,
  prompt: string,
  firstFrame: File | null,
  lastFrame: File | null,
  loop: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};

      const formData = new FormData();
      formData.append("user_prompt", prompt);
      if (firstFrame) {
        formData.append("image_url", firstFrame);
      }
      if (lastFrame) {
        formData.append("image_end_url", lastFrame);
        formData.append("loop", loop);
      }

      const res = await apiFetch("luma/submit", {
        method: "POST",
        body: formData,
        headers: {},
      });
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      if (result.video) {
        resolve({ output: result.video, id: result.id });
        return;
      }

      result = await fetchLumaTask(taskId, result.id);
      resolve({ output: result.video, id: result.id });
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: Luma
async function fetchLumaTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`luma/task/${resultId}/fetch`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
            return;
          }
          if (data.state === "completed") {
            resolve(data);
          } else if (data.state === "failed") {
            reject("Task failed");
          } else {
            if (counter < maxAttempts) {
              counter++;
              const { getTask } = useTaskStore.getState();
              const task = getTask(taskId);
              if (task) {
                setTimeout(() => polling(taskId, resultId), 10000); // 每隔10秒轮询一次
              }
            } else {
              reject("Max attempts reached!");
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

// 拓展: Luma
export async function extendLumaVideo(
  taskId: string,
  key: string,
  prompt: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};

      const formData = new FormData();
      formData.append("user_prompt", prompt);

      const res = await apiFetch(`luma/extend/${key}`, {
        method: "POST",
        body: formData,
        headers: {},
      });
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      if (result.video) {
        resolve({ output: result.video, id: result.id });
        return;
      }
      result = await fetchLumaTask(taskId, result.id);
      resolve({ output: result.video, id: result.id });
    } catch (error) {
      reject(error);
    }
  });
}

// 视频：Kling
export async function getKlingVideo(
  taskId: string,
  prompt: string,
  firstFrame: string,
  lastFrame: string,
  ratio: string,
  type: string,
  time: string,
  version: string,
  imageList: string[]
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      let path = "";
      let url = "";
      // ——版本
      let _version = version === "16" ? "_16" : "";
      // 1.5版本图生视频快速需要传版本号
      if (
        version === "15" &&
        type === "fast" &&
        firstFrame &&
        !imageList.length
      ) {
        _version = "_15";
      }
      // ——时间
      let _time = `_${time}`;
      // 1.5版本的图生视频5秒不需要传
      if (
        version === "15" &&
        time === "5s" &&
        firstFrame &&
        !imageList.length
      ) {
        _time = "";
      }
      // ——类型
      let _hq = type === "fast" ? "" : "_hq";
      // 1.5版本文生视频只有高清hq
      if (version === "15" && !firstFrame && !imageList.length) {
        _hq = "_hq";
      }
      if (firstFrame) {
        path = `m2v${_version}_img2video${_hq}${_time}`;
      } else {
        path = `m2v${_version}_txt2video${_hq}${_time}`;
      }
      url = `klingai/${path}`;
      // console.log(url);

      interface KlingData {
        prompt: string;
        negative_prompt: string;
        cfg: string;
        aspect_ratio: string;
        camera_type: string;
        camera_value: string;
        input_image?: string;
        tail_image?: string;
        image_list?: string[];
      }

      const data: KlingData = {
        prompt,
        negative_prompt: "",
        cfg: "0.5",
        aspect_ratio: ratio,
        camera_type: "zoom",
        camera_value: "-5",
      };

      if (firstFrame) {
        data.input_image = firstFrame;
        if (lastFrame) {
          data.tail_image = lastFrame;
        }
      } else if (imageList.length > 0) {
        data.image_list = imageList;
      }

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

      if (result.error) {
        reject(result.error);
      }

      const video = result.data.works[0]?.resource.resource;
      if (video) {
        const id = type === "fast" ? result.data.task.id : "";
        resolve({ output: video, id });
        return;
      }
      result = await fetchKlingTask(taskId, result.data.task.id);
      resolve({ output: result.video, id: type === "fast" ? result.id : "" });
    } catch (error) {
      reject(error);
    }
  });
}

// 拓展：Kling
export async function extendKlingVideo(
  taskId: string,
  key: string,
  prompt: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};

      const url = "klingai/m2v_extend_video";
      const formdata = new FormData();
      formdata.append("prompt", prompt);
      formdata.append("task_id", key);

      const res = await apiFetch(url, {
        method: "POST",
        body: formdata,
        headers: {},
      });
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      const video = result.data.works[0]?.resource.resource;
      if (video) {
        const id = result.data.task.id;
        resolve({ output: video, id });
        return;
      }
      result = await fetchKlingTask(taskId, result.data.task.id);
      resolve({ output: result.video, id: result.id });
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: Kling
async function fetchKlingTask(taskId: string, resultId: string) {
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
}

// Create Video：Runway-turbo
export async function getRunwayVideo(
  taskId: string,
  prompt: string,
  firstFrame: File,
  lastFrame: File,
  time: string,
  type: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      const file = firstFrame || lastFrame;
      const url =
        type === "fast" && file ? "runway_turbo/submit" : "runway/submit";

      const formdata = new FormData();
      if (!file) {
        formdata.append("text_prompt", prompt);
        formdata.append("seconds", time);
        formdata.append("seed", "");
      } else if (type !== "fast") {
        const end = firstFrame ? "false" : "true";
        formdata.append("init_image", file);
        formdata.append("text_prompt", prompt);
        formdata.append("seconds", time);
        formdata.append("seed", "");
        formdata.append("image_as_end_frame", end);
      } else {
        formdata.append("image_url", firstFrame || "");
        formdata.append("image_end_url", lastFrame || "");
        formdata.append("text_prompt", prompt);
        formdata.append("seconds", time);
        formdata.append("seed", "");
      }

      const res = await apiFetch(url, {
        method: "POST",
        body: formdata,
        headers: {},
      });
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      const video = result.task.artifacts[0]?.url;
      if (video) {
        resolve({ output: video });
        return;
      }
      result = await fetchRunwayTask(taskId, result.task.id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: Runway
async function fetchRunwayTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(
        `runway/task/${resultId}/fetch
      `,
        {
          headers: {},
        }
      )
        .then((response) => response.json())
        .then((data) => {
          const video = data.task.artifacts[0]?.url;
          if (video) {
            resolve({ output: video });
          } else if (data.task.status === "FAILED") {
            reject("Fetch task failed");
          } else {
            if (counter < maxAttempts) {
              counter++;
              const { getTask } = useTaskStore.getState();
              const task = getTask(taskId);
              if (task) {
                setTimeout(() => polling(taskId, resultId), 10000);
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

// 视频: Cog
export async function getCogVideo(
  taskId: string,
  prompt: string,
  url: string,
  type: string,
  audio: string,
  time: string,
  ratio: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      let raw = "";
      if (url) {
        raw = JSON.stringify({
          model: "cogvideox-2",
          prompt: prompt,
          image_url: url,
          quality: type === "fast" ? "speed" : "quality",
          with_audio: audio === "true",
          seconds: Number(time.replace("s", "")),
          size: ratio.split(":").join("x"),
        });
      } else {
        raw = JSON.stringify({
          model: "cogvideox-2",
          prompt: prompt,
          quality: type === "fast" ? "speed" : "quality",
          with_audio: audio === "true",
        });
      }

      const res = await apiFetch("zhipu/api/paas/v4/videos/generations", {
        method: "POST",
        body: raw,
        headers: {
          "Content-Type": "application/json;charset:utf-8;",
        },
      });
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      // save task
      if (result.task_status === "SUCCESS") {
        resolve({ output: result.video_result[0].url });
        return;
      }
      result = await fetchCogTask(taskId, result.id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: Cog
async function fetchCogTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`zhipu/api/paas/v4/async-result/${resultId}`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
            return;
          }
          if (data.task_status === "SUCCESS") {
            resolve({ output: data.video_result[0].url });
          } else if (data.state === "failed") {
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

// 视频: Minimax
export async function getMinimaxVideo(
  taskId: string,
  model: string,
  prompt: string,
  url: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let data: any = {};
      data = {
        model: model,
        prompt: prompt,
        ...(model === "S2V-01"
          ? { subject_reference: [{ type: "character", image: [url] }] }
          : url
            ? { first_frame_image: url }
            : {}),
      };

      const res = await apiFetch("minimaxi/v1/video_generation", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json;charset:utf-8;",
        },
      });
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      if (!result.task_id) {
        // throw new Error("Fetch faild");
        throw result.base_resp.status_msg;
      }
      result = await fetchMinimaxTask(taskId, result.task_id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: Minimax
async function fetchMinimaxTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`minimaxi/v1/query/video_generation?task_id=${resultId}`, {
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
}

// 查询: Minimax
async function fetchMinimaxFile(resultId: string, fileId: string) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxRetries = 3;

    const polling = (fileId: string) => {
      apiFetch(
        `minimaxi/v1/files/retrieve?file_id=${fileId}&task_id=${resultId}`,
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

// 视频: Genmo
export async function getGenmoVideo(
  taskId: string,
  prompt: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};

      const data = {
        prompt: prompt,
        enable_prompt_expansion: true,
        seed: 1936147,
      };

      const res = await apiFetch("302/submit/mochi-v1", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json;charset:utf-8;",
        },
      });
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();

      result = await fetchGenmoTask(taskId, result.request_id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: Genmo
async function fetchGenmoTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`302/submit/mochi-v1?request_id=${resultId}`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
            return;
          }
          if (data.status === "COMPLETED") {
            resolve({ output: data.video.url });
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

// 视频: Haiper
export async function getHaiperVideo(
  taskId: string,
  prompt: string,
  url: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      let raw = "";
      if (url) {
        raw = JSON.stringify({
          prompt: prompt,
          image_url: url,
          prompt_enhancer: true,
          duration: "4",
          seed: 1936147,
        });
      } else {
        raw = JSON.stringify({
          prompt: prompt,
          prompt_enhancer: true,
          duration: "4",
          seed: 1936147,
        });
      }

      const res = await apiFetch("302/submit/haiper-video-v2", {
        method: "POST",
        body: raw,
        headers: {
          "Content-Type": "application/json;charset:utf-8;",
        },
      });
      if (!res.ok) {
        throw await res.json();
      }

      const data = await res.json();

      result = await fetchHaiperTask(taskId, data.request_id);
      resolve({ output: result.output });
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: Haiper
async function fetchHaiperTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 180;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`302/submit/haiper-video-v2?request_id=${resultId}`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
            return;
          }
          if (data.status === "COMPLETED") {
            resolve({ output: data.video.url });
          } else if (data.state === "failed") {
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

// 视频: Pixverse
export async function getPixverseVideo(
  taskId: string,
  prompt: string,
  url: string,
  template: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  const prompts: Record<string, string> = {
    "304826314164992": "Transform into Hulk and smash everything",
    "304826126435072": "Transform into a clown and smile mysteriously",
    "304826054394624": "Activate Iron Man mode",
    "304826374632192": "Transform into Batman and protect the night",
    "303788802773760": "Wicked Shots",
    "303624537709312": "We Are Venom!",
    "304358279051648": "Venom! (Color Blind Box Edition)",
    "303624424723200": "Hug Your Love",
    "302325299651648": "Zombie Mode",
    "302325299692608": "Squish It",
    "302325299672128": "Zombie Hand",
    "302325299661888": "Wizard Hat",
    "302325299711040": "Leggy Run",
    "302325299682368": "Monster Invades",
    "302325299702848": "Lego Blast",
    "313359138372032": "Transform into Sailor Moon with Moon Crystal Power",
    "313359209531840": "Black Goku Engine, face destiny head-on",
    "302325299721280": "Bring art to life",
    "315446232403008": "Instant baby face, return to childhood",
    "316645675647872": "Cigar boss, take a deep breath",
    "315447659476032": "Unleash your fighting spirit",
    "315446315336768": "Kiss of love, fill the screen with affection",
    "312314911869312": "Try on a Christmas outfit",
    "311521768592256": "Christmas gift blind box, I want:",
    "311521879229312": "Where's Santa? Discover Santa around the world",
    "305714097668480": "Who's Venom? Reveal the true form",
    "306059795500352": "Summon Venom brother, embrace with love",
    "310371322329472": "Everything can be curly, change your hairstyle",
    "308552687706496": "Grow luscious hair, no more baldness",
    "309283958194560": "Transform into Wonder Woman, conquer the impossible",
    "307489548427968": "Transform into Catwoman, captivate the crowd",
    "307489434436288": "Become Harley Quinn, master of charm and madness",
    "308621408717184": "Become a muscle man, enjoy the strength",
    "316139945292864": "Squid Game survival challenge", // 鱿鱼游戏
    "317013620689664": "Ingi's mysterious gaze", // 英姬的凝视
  };
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      const raw = JSON.stringify({
        model: "v3",
        prompt: prompt || (template in prompts ? prompts[template] : ""),
        image: url,
        template_id: Number(template),
        motion_strength: 0.55,
        motion_scale: {
          horizontal: -3.3,
          vertical: 2.7,
          roll: 4,
          zoom: -4.4,
        },
      });

      const res = await apiFetch("pix/generate", {
        method: "POST",
        body: raw,
        headers: {
          "Content-Type": "application/json;charset:utf-8;",
        },
      });
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();

      result = await fetchPixverseTask(taskId, result.data.task_id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: Pixverse
async function fetchPixverseTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 60;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`pix/task/${resultId}/fetch`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
            return;
          }
          if (data.data.video_url) {
            resolve({ output: data.data.video_url });
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

// 视频: Lightricks
export async function getLightricksVideo(
  taskId: string,
  prompt: string,
  url: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      let path = "";
      let raw = "";
      if (url) {
        path = "302/submit/ltx-video-i2v";
        raw = JSON.stringify({
          image_url: url,
          prompt: prompt,
          negative_prompt:
            "low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly",
          num_inference_steps: 30,
          guidance_scale: 3,
        });
      } else {
        path = "302/submit/ltx-video";
        raw = JSON.stringify({
          prompt: prompt,
          negative_prompt:
            "low quality, worst quality, deformed, distorted, disfigured, motion smear, motion artifacts, fused fingers, bad anatomy, weird hand, ugly",
          num_inference_steps: 30,
          guidance_scale: 3,
        });
      }

      const res = await apiFetch(path, {
        method: "POST",
        body: raw,
        headers: {
          "Content-Type": "application/json;charset:utf-8;",
        },
      });
      if (!res.ok) {
        throw await res.json();
      }

      const data = await res.json();

      if (data.video.url) {
        resolve({ output: data.video.url });
      } else {
        throw new Error("Create Haiper Video Error: ");
      }
    } catch (error) {
      reject(error);
    }
  });
}

// 视频: Hunyuan
export async function getHunyuanVideo(
  taskId: string,
  prompt: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      const raw = JSON.stringify({
        prompt: prompt,
      });

      const res = await apiFetch("302/submit/hunyuan-video", {
        method: "POST",
        body: raw,
        headers: {
          "Content-Type": "application/json;charset:utf-8;",
        },
      });
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      result = await fetchHunyuanTask(taskId, result.request_id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: Hunyuan
async function fetchHunyuanTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 180;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`302/submit/hunyuan-video?request_id=${resultId}`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
            return;
          }
          if (data.status === "COMPLETED") {
            resolve({ output: data.video.url });
          } else if (data.state === "failed") {
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

// 视频: Wanx
export async function getWanxVideo(
  taskId: string,
  model: string,
  prompt: string,
  size: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      const raw = JSON.stringify({
        model: model,
        input: {
          prompt: prompt,
        },
        parameters: {
          size: size,
        },
      });

      const res = await apiFetch(
        "aliyun/api/v1/services/aigc/video-generation/video-synthesis",
        {
          method: "POST",
          body: raw,
          headers: {
            "Content-Type": "application/json;charset:utf-8;",
          },
        }
      );
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      result = await fetchWanxTask(taskId, result.output.task_id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: Wanx
async function fetchWanxTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 180;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`aliyun/api/v1/tasks/${resultId}`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
            return;
          }
          if (data.output.task_status === "SUCCEEDED") {
            resolve({ output: data.output.video_url });
          } else if (data.output.task_status === "failed") {
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

// 视频: Vidu
export async function getViduVideo(
  taskId: string,
  prompt: string,
  videoPrompt: string,
  mergeUrl: string,
  firstUrl: string,
  lastUrl: string,
  thirdUrl: string,
  ratio: string,
  type: string,
  style: string,
  time: string,
  resolution: string,
  scene: string
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      let path = "";
      let data = {};
      let genType = "text2video";
      let version = "1.5";
      const prompts = [
        {
          type: "text",
          content: videoPrompt,
        },
      ];

      switch (type) {
        case "general":
          // push firstimage
          if (firstUrl) {
            genType = "img2video";
            prompts.push({
              type: "image",
              content: firstUrl,
            });
          }
          // push lastimage
          if (lastUrl) {
            genType = "img2video";
            prompts.push({
              type: "image",
              content: lastUrl,
            });
          }
          // use headtailimg2video when firstUrl && lastUrl
          if (firstUrl && lastUrl) {
            genType = "headtailimg2video";
          }
          // set path
          path = "vidu/ent/v1/tasks";
          // set data
          if (firstUrl || lastUrl) {
            version = "2.0";
            data = {
              type: genType,
              model_version: version,
              input: {
                prompts: prompts,
              },
              output_params: {
                sample_count: 1,
                resolution: time === "8" ? "720p" : resolution,
                aspect_ratio: ratio,
                movement_amplitude: "auto",
                duration: Number(time),
              },
              moderation: false,
            };
          } else {
            data = {
              type: genType,
              style: style,
              model_version: version,
              input: {
                seed: 123,
                enhance: true,
                prompts: prompts,
              },
              output_params: {
                sample_count: 1,
                resolution: time === "8" ? "720p" : resolution,
                aspect_ratio: ratio,
                movement_amplitude: "auto",
                duration: Number(time),
              },
              moderation: false,
            };
          }

          break;
        case "character":
          // gen type
          genType = "character2video";
          // push firstimage
          if (firstUrl) {
            prompts.push({
              type: "image",
              content: firstUrl,
            });
          }
          // push lastimage
          if (lastUrl) {
            prompts.push({
              type: "image",
              content: lastUrl,
            });
          }
          // push thirdimage
          if (thirdUrl) {
            prompts.push({
              type: "image",
              content: thirdUrl,
            });
          }
          // set path
          path = "vidu/ent/v1/tasks";
          // set data
          version = "2.0";
          data = {
            type: genType,
            model_version: version,
            input: {
              enhance: true,
              multi_image_boost: true,
              prompts: prompts,
            },
            output_params: {
              sample_count: 1,
              // resolution: time === "8" ? "720p" : resolution,
              // duration: Number(time),
              resolution: resolution,
              duration: 4,
              aspect_ratio: ratio,
              movement_amplitude: "auto",
            },
            moderation: false,
          };

          break;
        case "scene":
          // complete prompt
          // # 拥抱
          if (scene.split("@")[0] === "hug") {
            prompts[0].content = `拥抱${prompt ? `,${prompt}` : ""}`;
          }
          // # 亲吻
          if (scene.split("@")[0] === "kiss") {
            prompts[0].content = `亲吻${prompt ? `,${prompt}` : ""}`;
          }
          // # 圣诞
          if (scene.split("@")[0] === "christmas") {
            // 变身
            if (scene.split("@")[1] === "effect") {
              prompts[0].content = `视频内容\\n画面中的人物从下前方轻轻举起鲜红的布，动作干净利落地将其从头覆盖到全身，然后随着人物将红布迅速向下扯下，人物变成了充满节日气息的圣诞老人。\\n# 要求\\n1.Style设定为:Realistic, HD\\n2.根据用户上传图片确定人物数量，不要出现[一群人]、[们]等代词而是精准地指出人物数量\\n3.如果用户上传图片有多个人物，则他们需要一起举起红布，所有人都变身为圣诞老人。不要出现图片中没有的人物${prompt ? `,${prompt}` : ""}`;
            }
            // 礼物
            if (scene.split("@")[1] === "gifts") {
              prompts[0].content = `视频内容\\n镜头中人物看向右边，然后一个圣诞老人满面笑容地从右边走入画面，手中捧着一个精美的礼物盒。他轻轻将礼物递给画面中的人物，动作自然且充满温暖。镜头聚焦在接到礼物的人物，人物神情中充满惊喜与感激。画面捕捉到人物的微表情和互动细节。\\n# 要求\\n1.Style设定为:Realistic, HD\\n2.根据用户上传图片确定人物数量，不要出现[一群人]、[们]等代词而是精准地指出人物数量\\n3.如果用户上传图片有多个人物，则他们需要一起举起红布，所有人都变身为圣诞老人。不要出现图片中没有的人物${prompt ? `,${prompt}` : ""}`;
            }
            // 举杯
            if (scene.split("@")[1] === "merry") {
              prompts[0].content = `视频内容\\n画面人物手里拿起香槟酒杯，庆祝圣诞快乐，随着镜头拉远，画面出现圣诞树等圣诞节日物品\\n# 要求\\n1.Take a step-by-step approach in your response\\n2.以我的视频描述为第一要素，背景的描述统一、合理，不要描述两次.\\n3.根据用户上传图片确定人物数量，不要出现[一群人]、[们]等代词而是精准地指出人物数量\\n4.Motion Level 设定为：Middle\\n5.如果用户上传图片有多个人物，每个人都需要拿起香槟酒杯。不要出现图片中没有的人物${prompt ? `,${prompt}` : ""}`;
            }
            // 拥抱
            if (scene.split("@")[1] === "hug") {
              prompts[0].content = `视频内容\\n镜头中人物看向画面外，接着一个圣诞老人满面笑容地从画面外走入画面，然后和人物拥抱，动作自然且充满温暖，镜头聚焦在一个温暖的拥抱，画面捕捉到人物的的微表情和互动细节\\n# 要求\\n1.根据人物的位置和状态合理的设计动作，而不是突兀的直接拥抱，要先描写人物转变到一个合适拥抱的姿势\\n2.Take a step-by-step approach in your response\\n3.根据用户上传图片确定人物数量，不要出现[一群人]、[们]等代词而是精准地指出人物数量\\n4.如果图片中有多个人物，则需要一起和圣诞老人拥抱。不要出现图片中没有的人物\\n5.强调只有1个圣诞老人${prompt ? `,${prompt}` : ""}`;
            }
          }
          // # 变形
          if (scene.split("@")[0] === "morphlab") {
            // 膨胀
            if (scene.split("@")[1] === "inflate") {
              prompts[0].content = `视频内容\\n画面中主体开始膨胀变形，变得越来越大，越来越圆，就像一个气球，慢慢飘了起来\\n# 要求\\n1.根据用户上传图片确定主体数量,每个主体都要膨胀\\n2.Motion Level 设定为:Middle\\n3.以我的视频内容为第一要素，背景的描述统一、合理，不要描述两次.${prompt ? `,${prompt}` : ""}`;
            }
            // 扭曲
            if (scene.split("@")[1] === "twist") {
              prompts[0].content = `视频内容\\n画面开始，主体静止不动。随后，一双大手出现，将主体像橡皮泥般抓住并挤压。\\n随着主体逐渐缩小，被夹在手指间柔软变形\\n# 要求\\n1.根据用户上传图片确定主体数量,每个主体都要被捏扁\\n2.Motion Level 设定为:Middle\\n3.以我的视频内容为第一要素，背景的描述统一、合理，不要描述两次.${prompt ? `,${prompt}` : ""}`;
            }
            // 爆炸
            if (scene.split("@")[1] === "explode") {
              prompts[0].content = `视频内容\\n画面开始主体突然爆炸，细碎的颗粒爆炸开来\\n# 要求\\n1.根据用户上传图片确定主体数量,每个主体都要爆炸\\n2.Motion Level 设定为:Middle\\n3.以我的视频内容为第一要素，背景的描述统一、合理，不要描述两次.${prompt ? `,${prompt}` : ""}`;
            }
            // 扭曲
            if (scene.split("@")[1] === "melt") {
              prompts[0].content = `视频内容\\n画面中主体慢慢地开始融化，最终形成一个表面光滑的水坑\\n# 要求\\n1.根据用户上传图片确定主体数量,每个主体都要融化\\n2.Motion Level 设定为:Middle\\n3.以我的视频内容为第一要素，背景的描述统一、合理，不要描述两次.${prompt ? `,${prompt}` : ""}`;
            }
          }
          // 实况照片
          if (scene.split("@")[0] === "live_photo") {
            // 微笑
            if (scene.split("@")[1] === "smile") {
              prompts[0].content = `视频内容\\n画面中的人物面对镜头，露出了甜美动人的微笑.${prompt ? `,${prompt}` : ""}`;
            }
            // 风动
            if (scene.split("@")[1] === "wind") {
              prompts[0].content = `主体头发丝被风朝着某一个方向微微吹动.${prompt ? `,${prompt}` : ""}`;
            }
            // 镜头动
            if (scene.split("@")[1] === "camera") {
              prompts[0].content = `镜头缓缓拉近,风轻轻吹着主体.${prompt ? `,${prompt}` : ""}`;
            }
            // 走路
            if (scene.split("@")[1] === "walk") {
              prompts[0].content = `视频内容\\n画面主体，正对镜头走模特步\\n# 要求\\n1.根据img图片人物状态，设计合适的镜头运动，镜头应该慢慢转变为中景或者牛仔镜头【拉远或者推进】能够显露出人物的大半个身体\\n2.根据img图片人物状态，设计合理的动作转变，最终人物应当面对镜头走模特步\\n3.严格根据图片确定人物外观，不要出现图片没有的人物.${prompt ? `,${prompt}` : ""}`;
            }
          }
          // 情绪特效
          if (scene.split("@")[0] === "emotionlab") {
            // 恐惧
            if (scene.split("@")[1] === "terrible") {
              prompts[0].content = `视频内容\\n画面主体的表情开始慢慢变化，变得恐惧害怕，眼神里满是无助和惊慌，害怕的大声尖叫\\n# 要求\\n1.根据用户上传图片确定主体数量、人物性别、shot_size,每个主体都是同样的表情变化\\n2.Motion Level 设定为:Middle\\n3.以我的视频内容为第一要素，背景和图片保持一致，不要变化，不要描述两次\\n4.镜头固定不要移动..${prompt ? `,${prompt}` : ""}`;
            }
            // 微笑
            if (scene.split("@")[1] === "smile") {
              prompts[0].content = `视频内容\\n画面主体的表情开始慢慢变化,表情逐渐放松，嘴角轻轻上扬，眼神变得柔和，微笑逐渐展现出温和与宁静的氛围。\\n# 要求\\n1.根据用户上传图片确定主体数量、人物性别、shot_size,每个主体都是同样的表情变化\\n2.Motion Level 设定为:Middle\\n3.以我的视频内容为第一要素，背景的描述统一、合理，不要描述两次\\n4.镜头固定不要移动\\n5.根据人物初始状态选择比较微小的微笑，还是比较开朗的微笑.不要过于夸张的微笑..${prompt ? `,${prompt}` : ""}`;
            }
            // 狂笑
            if (scene.split("@")[1] === "laugh") {
              prompts[0].content = `视频内容\\n画面主体的表情开始慢慢变化,随着心情的放松，眉头慢慢舒展，嘴角开始上扬。然后他的笑容逐渐扩大，眼睛也变得更加明亮，仿佛看到了什么有趣的事物。最终，他大笑起来，嘴巴张得大大的，露出洁白的牙齿，动作夸张\\n# 要求\\n1.根据用户上传图片确定主体数量、人物性别、shot_size,每个主体都是同样的表情变化\\n2.Motion Level 设定为:Middle\\n3.以我的视频内容为第一要素，背景的描述统一、合理，不要描述两次\\n4.镜头固定不要移动,人物表情变化要自然..${prompt ? `,${prompt}` : ""}`;
            }
            // 惊讶
            if (scene.split("@")[1] === "surprised") {
              prompts[0].content = `视频内容\\n图中的人物逐渐露出特别惊讶的表情，眼睛睁大，嘴巴微微张开，透出难以置信的神情。\\n# 要求\\n1.根据用户上传图片确定主体数量、人物性别、shot_size,每个主体都是同样的表情变化\\n2.Motion Level 设定为:Middle\\n3.以我的视频内容为第一要素，背景的描述统一、合理，不要描述两次\\n4.镜头固定不要移动,人物主要是表情变化，人物表情变化要自然..${prompt ? `,${prompt}` : ""}`;
            }
          }
          // 老照片
          if (scene.split("@")[0] === "live_memory") {
            // 老照片
            if (scene.split("@")[1] === "old_photo") {
              prompts[0].content = `视频内容\\n视频中的人物们，简单互动，微笑看着屏幕\\n# 要求\\n1.严格根据图片判断有多少个人物，精准简要的描述人物外观\\n2.Motion Level ：Small..${prompt ? `,${prompt}` : ""}`;
            }
          }
          // 发型特效
          if (scene.split("@")[0] === "hair_swap") {
            // 羊毛卷
            if (scene.split("@")[1] === "curl") {
              prompts[0].content = `视频内容\\n角色正对镜头不动，眨眨眼睛，头发缓慢转变为"{Curly Wool Hair}"发型\\n# 要求 角色静静地面对镜头，目光平和，眨眨眼睛，头发的变换成为画面的焦点，呈现出一场优雅的发型演化表演。${prompt ? `,${prompt}` : ""}`;
            }
            // 双马尾
            if (scene.split("@")[1] === "double") {
              prompts[0].content = `视频内容\\n角色正对镜头不动，眨眨眼睛，头发缓慢转变为"{Twin Tails}"发型\\n# 要求 角色静静地面对镜头，目光平和，眨眨眼睛，头发的变换成为画面的焦点，呈现出一场优雅的发型演化表演。${prompt ? `,${prompt}` : ""}`;
            }
            // 长发
            if (scene.split("@")[1] === "long") {
              prompts[0].content = `视频内容\\n角色正对镜头不动，眨眨眼睛，头发缓慢转变为"{Long Hair}"发型\\n# 要求 角色静静地面对镜头，目光平和，眨眨眼睛，头发的变换成为画面的焦点，呈现出一场优雅的发型演化表演。${prompt ? `,${prompt}` : ""}`;
            }
          }
          // 互动特效
          if (scene.split("@")[0] === "interaction") {
            // 爱的互动
            if (scene.split("@")[1] === "love") {
              prompts[0].content = `图片中的两个人[简要精准的外观描述]面对镜头，各自伸出一只手，合在一起在胸前比了一个爱心。${prompt ? `,${prompt}` : ""}`;
            }
            // 送玫瑰花
            if (scene.split("@")[1] === "rose") {
              prompts[0].content = `视频内容\\n镜头左边的人物[简要精准的外观描述、性别描述]拿起一只玫瑰花转身送给图片右边的人物[简要精准的外观描述]，右边的人物同样转身，面对面接受玫瑰花\\n# 要求1.Shot Size：镜头缓慢自然的变为Medium Shot；2.Camera Movement:根据图片初始镜头确定镜头是Zoom Out 还是Zoom In才能变为Medium Shot，如果初始镜头为近景则需要Zoom Out，如果初始就是Medium Shot则为None。${prompt ? `,${prompt}` : ""}`;
            }
          }
          // 新年特效
          if (scene.split("@")[0] === "lunar_newyear") {
            // 烟花
            if (scene.split("@")[1] === "fireworks") {
              prompts[0].content = `视频内容\\n视频展示人物手持仙女棒 面对镜头，人物身后绽放新年烟花 烟花上写2025 采用远景视角 动作自然且充满温暖，画面捕捉到人物的的微表情和互动细节  \\n# 要求1.根据人物的位置和状态合理的设计动作.2.Take a step-by-step approach in your response.3.根据用户上传图片确定人物数量，不要出现[一群人]、[们]等代词而是精准地指出人物数量.4.如果图片中有多个人物，则需要一起手持仙女棒。不要出现图片中没有的人物.5.如果图片展示了背景图，则设定为背景并详细描述.6.保证人物始终在画面中心。${prompt ? `,${prompt}` : ""}`;
            }
            // 举杯
            if (scene.split("@")[1] === "cheers") {
              prompts[0].content = `视频内容\\n视频展示新年餐桌上人物拿着香槟高脚杯 干杯庆祝 场面十分红火热闹 动作自然且充满温暖，画面捕捉到人物的的微表情和互动细节.\\n# 要求1.根据人物的位置和状态合理的设计动作.2.Take a step-by-step approach in your response.3.根据用户上传图片确定人物数量，不要出现[一群人]，不要出现图片中没有的人物.4.如果图片中有多个人物，则需要一起举杯庆祝。每个只拿一只杯子.5.如果图片展示了背景图，则设定为背景并详细描述.6.保证人物始终在画面中心 颜色温馨自然喜庆，不要黑白色。${prompt ? `,${prompt}` : ""}`;
            }
            // 礼物
            if (scene.split("@")[1] === "gift") {
              prompts[0].content = `视频内容\\n视频展示人物推开屋门 门内在下金光闪闪的红包雨 洒在人物身上 人物很开心。人物动作自然且充满温暖，画面捕捉到人物的的微表情和互动细节 \\n# 要求1.根据人物的位置和状态合理的设计动作.2.Take a step-by-step approach in your response.3.根据用户上传图片确定人物数量，不要出现[一群人]、[们]等代词而是精准地指出人物数量.4.不要出现图片中没有的人物.5.保证人物始终在画面中心.6.推开房门后才洒落红包雨，推开房门前不要蹦出东西.7.洒落的是红色的红包雨不是金币 .8.要有一把真实的门，要有打开房门的动作，红包从门外掉落。${prompt ? `,${prompt}` : ""}`;
            }
          }
          // 童年回忆
          if (scene.split("@")[0] === "youth_rewind") {
            // 童年回忆
            if (scene.split("@")[1] === "rewind") {
              prompts[0].content = `Video content\\ n  The subject(s) is/are facing the camera, appearing as their 3-year-old self, wearing a red cotton-padded jacket, holding burning sparklers in both hands, and joyfully dancing in the snowy courtyard. The sparklers flicker brightly, casting a warm glow on their happy, smiling faces. The subject(s) performs lively, natural movements, such as waving the sparklers while skipping around, always remaining in the center of the frame.  The scene is set in a snowy village courtyard during a festive winter evening, as shown in the provided background. Snow covers the ground and rooftops, while red lanterns hang overhead, glowing warmly in the golden sunlight of dusk. The wooden doors of nearby houses are adorned with festive decorations. The overall ambiance is filled with a nostalgic and joyful Chinese New Year atmosphere.  The warm orange tones from the sunlight and the red lanterns harmonize with the vibrant movements of the subject(s), enhancing the festive mood. The steady camera ensures the subject(s) stays at the center of the frame throughout the joyous performance.  \\ n #Requirements\\ 1. The subject(s) in the picture may be pets or one or more people. Generate according to the actual situation in the reference image.  2. The subject(s) should smile and immerse themselves in the festive atmosphere of Chinese New Year.  3. The subject(s) must always remain at the center of the frame, even while joyfully dancing. 4.The subject(s), including any pets, must wear red New Year cotton-padded jackets. ${prompt ? `,${prompt}` : ""}`;
            }
          }
          // 古风换装
          if (scene.split("@")[0] === "dynasty_dress") {
            // 古风换装
            if (scene.split("@")[1] === "dress") {
              prompts[0].content = `视频内容\\n一个角色穿着服装和鞋子面对镜头摆pose，眨眨眼睛，甜美微笑\\n# 要求 - 对角色的面部细节详细描述，对服装配饰的各种细节要尽量精准详细的描述.- 如果图片展示了[服装、手提包、配饰、帽子、鞋子]，需要出现在对人物的服装描述中.- 如果图片展示了背景图，则设定为背景并详细描述。- 只有1个角色！不要出现任何复数代词.- Shot Size 为：Wide Shot. ${prompt ? `,${prompt}` : ""}`;
            }
          }
          // 全家福比心
          if (scene.split("@")[0] === "lover_pose") {
            // 全家福比心
            if (scene.split("@")[1] === "pose") {
              prompts[0].content = `视频内容\\n画中的角色面对镜头，抬起双手在胸前，做出比心的动作.\\n# 要求-根据图片判断人物数量，如果有多个人，每个人物都要做出比心的动作。 ${prompt ? `,${prompt}` : ""}`;
            }
          }
          // 财神特效
          if (scene.split("@")[0] === "wish_sender") {
            // 财神特效
            if (scene.split("@")[1] === "love") {
              prompts[0].content = `视频内容\\n 视频展示了红衣服财神角色站在人物角色旁边，他们一起面对镜头,每个人伸出双手各自在自己胸前比心，动作自然且充满温暖。\\n# 要求 1. 如果图片中有多个人物，则每个人各自在自己胸前比心。不要出现图片中没有的人物。2. 强调只有1个财神。3.如果图片展示了背景图，则设定为背景并详细描述。4. 保证人物和财神始终在画面中心。 ${prompt ? `,${prompt}` : ""}`;
            }
            // 财神发金币
            if (scene.split("@")[1] === "coins") {
              prompts[0].content = `视频内容\\n  视频展示一个财神角色与人物的互动。财神在人物旁边站立着举起双手向上洒金币，然后金币如雨点般从空中散落下来，主体人物伸出双手开心的抓住2个金币拿在手里，脸上露出惊喜的笑容。红色喜庆背景，充满了中国春节元素，金币细节。\\n# 要求 1.根据图片精准描述人物外观。2.根据图片精准描述财神外观和金币外观。3.如果图片展示了背景图，则设定为背景并详细描述。4.人物和财神时候总保持在画面中心。5.motion_level:small。 ${prompt ? `,${prompt}` : ""}`;
            }
          }
          // 婚礼特效
          if (scene.split("@")[0] === "dreamy_wedding") {
            // 梦幻婚礼
            prompts[0].content = `视频内容\\n 画面中的两个角色穿着婚纱和礼服，在草地上拍照。\\n# 要求 1.根据图片严谨判断主体数量与性别，精准描述主体面部特点。 ${prompt ? `,${prompt}` : ""}`;
          }
          // 浪漫公主抱
          if (scene.split("@")[0] === "romantic_lift") {
            // 浪漫公主抱
            prompts[0].content = `视频内容\\n 画面中的有两个角色，其中一个角色使用公主抱[Princess carry]的动作抱起旁边的角色。\\n# 要求 1. 根据图片精准描述角色外观，性别。2. 如果两个角色都是男生或者都是女生，则描述右边的角色抱起左边的角色。3.如果两个角色是一男一女，则描述男性角色抱起女性角色。 ${prompt ? `,${prompt}` : ""}`;
          }
          // 甜蜜求婚
          if (scene.split("@")[0] === "sweet_proposal") {
            // 甜蜜求婚
            prompts[0].content = `视频内容\\n 画面中的有两个角色，其中一个角色1[精准描述外观和性别]突然掏出红色的戒指盒，表情真挚的单膝下跪向旁边的角色2[精准描述外观和性别]求婚，角色2表现得很开心[描述惊喜的表情动作] 。\\n# 要求  - 严格根据图片判断人物数量，性别。- 如果图片中有男性角色，则指定该男性角色为角色1。如果图片中只有女性角色，则随机指定一个女性为角色1。 ${prompt ? `,${prompt}` : ""}`;
          }
          // 情侣降临
          if (scene.split("@")[0] === "couple_arrival") {
            // 情侣送花
            if (scene.split("@")[1] === "flower") {
              prompts[0].content = `视频内容\\n 镜头中人物看向镜头，接着该人物的{伴侣}满面笑容地从画面外走入画面，递给了人物一束花，人物感到惊喜，动作自然且充满温暖，画面捕捉到人物的的微表情和互动细节。伴侣形象为{user_input}\\n# 要求1.根据人物的位置和状态合理的设计动作，而不是突兀的直接出现。2.如果镜头中的人物是女性，那么{伴侣}就是一个帅气的与之年龄相仿的男性；如果镜头中的人物是男性，那么{伴侣}就是一个美丽的与之年龄相仿的女性，如果用户输入了{伴侣}形象，则按照用户输入的为准。3.Take a step-by-step approach in your response. 4.最后画面中的人数为2人。\\n# 要求  - 严格根据图片判断人物数量，性别。- 如果图片中有男性角色，则指定该男性角色为角色1。如果图片中只有女性角色，则随机指定一个女性为角色1。 ${prompt ? `,${prompt}` : ""}`;
            }
            // 情侣拥抱
            if (scene.split("@")[1] === "hug") {
              prompts[0].content = `视频内容\\n  主体站在画面中央，正面朝向镜头。主体的伴侣人从画面右侧以放松的步伐逐渐走入画面，接近站在中心的人，然后相互拥抱，动作充满温暖和爱意。拥抱完成后，两人转向镜头，正脸朝向镜头，展现出轻松与友好的氛围。主体的伴侣形象为：{user_input}\\n# 要求 1.如果没有特别说明，针对主体伴侣，主体伴侣跟主体的种族、年龄、肤色应该是匹配的。主体伴侣的性别一般是跟主体是相反的。2.主体伴侣的数量跟主体的数量应该是一致的，如果图片中是一个主体，那么主体伴侣应该也是一个。3.拥抱完成后，主体伴侣跟主体一样正脸朝向镜头。 ${prompt ? `,${prompt}` : ""}`;
            }
            // 情侣亲吻
            if (scene.split("@")[1] === "kiss") {
              prompts[0].content = `视频内容\\n  主体的视线、动作从原来的状态自然地转变为迎接主体的伴侣，主体的伴侣从画面左侧或者右侧以放松的步伐逐渐走入画面，接近站在中心的人。两人自然地接吻，动作充满温暖和爱意。接吻完成后，两人一同转向镜头，正脸朝向镜头，展现出轻松与友好的氛围。主体的伴侣形象为：{user_input}\\n# 要求 1.如果没有特别说明，针对主体伴侣，主体伴侣与主体的种族、年龄、肤色应该相似。2.主体伴侣的性别通常与主体相反。主体伴侣的数量与主体数量一致，若图片中是一个主体，则主体伴侣应为一个。3.接吻完成后，主体伴侣与主体一样正脸朝向镜头。4.如果参考图片的镜头类型为近景，镜头在伴侣走近时可以稍微拉远，调整视角以容纳两人完整的画面。 ${prompt ? `,${prompt}` : ""}`;
            }
            // 情侣挥手
            if (scene.split("@")[1] === "wave") {
              prompts[0].content = `视频内容\\n  主体的视线和动作自然过渡，迎接主体的伴侣。主体的伴侣从画面一侧以放松的步伐逐渐进入画面，靠近主体。两人自然地对视，流露出亲密的情感，随后一同转向镜头，面带温暖的微笑。两人用靠近彼此的手同时向镜头挥手，动作协调流畅，传递出轻松友好的氛围。主体的伴侣形象为：{user_input}\\n# 要求 1.如果没有特别说明，主体伴侣应与主体在种族、年龄、肤色上匹配。2.主体伴侣的性别通常与主体相反。3.主体伴侣的数量应与主体一致，例如，若画面中有一位主体，则主体伴侣也应为一位。4.主体伴侣与主体保持一致的动作和姿态，正面面向镜头并打招呼。 ${prompt ? `,${prompt}` : ""}`;
            }
            // 丘比特之箭
            if (scene.split("@")[1] === "cupid_arrow") {
              prompts[0].content = `视频内容\\n 一支粉色丘比特之箭极速从镜头左边飞进来射入左边角色的胸口，角色微微惊讶，捂住胸口，然后心动的红晕浮现，氛围暧昧。\\n# 要求  1.先描写人物被射中，然后描写转变惊讶心动。2.如果图片中有两个角色，被箭头射中的角色应该深情的看向对方。\\n# 环境 -浪漫背景（如云朵、玫瑰花瓣、星光）。-空气中漂浮着粉色或金色的光点。-柔和的光晕环绕。-爱心符号或梦幻气泡渐渐浮现。 ${prompt ? `,${prompt}` : ""}`;
            }
            // 萌宠恋人
            if (scene.split("@")[1] === "pet_lovers") {
              prompts[0].content = `视频内容\\n 两只可爱的宠物以后肢站立，呈现类似人类腿部的形态，前肢则类似人类手臂的结构，身穿配套的情侣装。它们面对镜头，彼此互动紧密，例如前肢轻轻拥抱或靠在一起，整体呈现出拟人化的亲密氛围。 ${prompt ? `,${prompt}` : ""}`;
            }
          }

          // prompts[0].content = scene.split("_").join(" ");
          // push firstimage
          if (firstUrl && !lastUrl) {
            prompts.push({
              type: "image",
              content: firstUrl,
            });
          }
          // push lastimage
          if (!firstUrl && lastUrl) {
            prompts.push({
              type: "image",
              content: lastUrl,
            });
          }
          // push lastimage
          if (firstUrl && lastUrl) {
            prompts.push({
              type: "image",
              content: mergeUrl,
            });
          }
          // set path
          path = "vidu/ent/v1/scenes/tasks";
          // set data
          data = {
            scene: scene.split("@")[0],
            input: {
              prompts: prompts,
            },
          };
          break;
        default:
          break;
      }

      const res = await apiFetch(path, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json;charset:utf-8;",
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      result = await fetchViduTask(taskId, result.id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });

  // return {output: "https://vidu-ai.oss-cn-hangzhou.aliyuncs.com/vidu/vidu.mp4"}
}

// 拓展: Vidu
export async function extendViduVideo(
  taskId: string,
  resultId: string,
  duration: number
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      const data = {
        type: "upscale",
        model: "stable",
        input: {
          creation_id: resultId,
        },
        output_params: {
          sample_count: 1,
          duration: duration,
        },
      };

      const res = await apiFetch("vidu/ent/v1/tasks", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json;charset:utf-8;",
        },
      });

      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      result = await fetchViduTask(taskId, result.id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: Vidu
async function fetchViduTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 180;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`vidu/ent/v1/tasks/${resultId}/creations`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
            return;
          }
          if (data.state === "success") {
            resolve({
              output: data.creations[0].url,
              id: data.creations[0].id,
            });
          } else if (data.state === "failed") {
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

// 视频：即梦
export async function getSeaweedVideo(
  taskId: string,
  videoPrompt: string,
  firstFrame: string,
  ratio: string
) {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};

      const content = [];
      if (videoPrompt) {
        content.push({
          type: "text",
          text: `${videoPrompt} --ratio ${ratio} --fps 24 --dur 5`,
        });
      }
      if (firstFrame) {
        content.push({
          type: "image_url",
          image_url: {
            url: firstFrame,
          },
        });
      }
      const res = await apiFetch("doubao/doubao-seaweed", {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw await res.json();
      }
      result = await res.json();
      result = await fetchSeaweedTask(taskId, result.id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 查询: 即梦
async function fetchSeaweedTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 180;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`doubao/doubao-seaweed/${resultId}`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
            return;
          }
          if (data.status === "succeeded") {
            resolve({ output: data.content.video_url });
          } else if (data.status === "FAILED") {
            reject("Fetch task failed");
          } else {
            if (counter < maxAttempts) {
              counter++;
              setTimeout(() => polling(taskId, resultId), 10000);
            } else {
              reject("Max attempts reached");
            }
          }
        });
    };
    polling(taskId, resultId);
  });
}

// 拓展比例//////
// 拓展比例: Runway
export async function extendRunwayVideoRatio(
  taskId: string,
  video: string,
  prompt: string,
  ratio: string,
  seconds = 5
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};

      const formData = new FormData();
      formData.append("video", video);
      formData.append("text_prompt", prompt);
      formData.append("outpaint_aspect_ratio", ratio);
      formData.append("seconds", seconds.toString());

      const res = await apiFetch("runway_turbo_expand/submit", {
        method: "POST",
        body: formData,
        headers: {},
      });
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      result = await fetchRunwayTask(taskId, result.task.id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 拓展风格/////
export async function extendVideoStyle(
  taskId: string,
  video: string,
  structure_transformation: number,
  text_prompt?: string,
  seconds?: number
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};

      const formData = new FormData();
      formData.append("video_prompt", video);
      // formData.append(
      //   "structure_transformation",
      //   structure_transformation.toString()
      // );
      if (text_prompt) {
        formData.append("text_prompt", text_prompt);
      }
      if (seconds) {
        formData.append("seconds", seconds.toString());
      }

      const res = await apiFetch("runway_turbo/submit", {
        method: "POST",
        body: formData,
        headers: {},
      });
      if (!res.ok) {
        throw await res.json();
      }

      result = await res.json();
      result = await fetchRunwayTask(taskId, result.task.id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 视频配音/////
// 音频生成：mmaudio
export async function getMmaudioAudio(
  taskId: string,
  video: string,
  prompt: string
  // seconds: number = 10
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any> {
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
  return new Promise(async (resolve, reject) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      let result: any = {};
      const data = {
        video_url: video,
        prompt: prompt,
        negative_prompt: "",
        num_steps: 25,
        // duration: 8,
        cfg_strength: 4.5,
      };

      const res = await apiFetch("302/submit/mmaudio", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json;charset:utf-8;",
        },
      });
      if (!res.ok) {
        throw await res.json();
      }
      result = await res.json();
      result = await fetchMmaudioTask(taskId, result.request_id);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// 音频获取：mmaudio
export async function fetchMmaudioTask(taskId: string, resultId: string) {
  return new Promise((resolve, reject) => {
    let counter = 0;
    const maxAttempts = 180;

    const polling = (taskId: string, resultId: string) => {
      apiFetch(`302/submit/mmaudio?request_id=${resultId}`, {
        headers: {},
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            reject(data.error);
            return;
          }
          if (data.status === "COMPLETED") {
            resolve({ output: data.video.url });
          } else if (data.state === "failed") {
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
