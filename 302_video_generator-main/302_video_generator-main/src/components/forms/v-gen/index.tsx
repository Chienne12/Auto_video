"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye } from "lucide-react";
import { useForm } from "react-hook-form";

import FormGenerator from "@/components/common/form-generator";
import { ImageCropper } from "@/components/common/image-cropper";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FORM_CONSTANTS, OPTION_CONSTANTS } from "@/constants";
import type { VideoFormProps } from "@/constants/forms";
import {
  type OptionProps,
  VIDEO_HIGGSFIELD_MOTION_OPTION,
  VIDEO_MODEL_OPTION,
} from "@/constants/options";
import { useClientTranslation, useIsMobile } from "@/hooks/global";
import { cn } from "@/lib/utils";
import { useFormStore, useTaskStore } from "@/stores";
import { TaskType } from "@/stores/slices/task-slice";

import { KlingV21Form } from "./kling-v2.1";
import { MinimaxHailuo02Form } from "./minimax-hailuo-02";
import { MJVideoForm } from "./mj-video";
import { PikaForm } from "./pika";
import type { VideoFormKey } from "./schema";
import { VideoSchema } from "./schema";
import { Veo3FastForm } from "./veo3-fast";
import { Veo3ProFramesForm } from "./veo3-pro-frames";
import { Veo3ProForm } from "./veo3-pro/indext";

type DefaultVideoData = {
  model: string;
  prompt: string;
  firstFile: null | string;
  lastFile: null | string;
  thirdFile: null | string;
  firstFrame: null | string;
  lastFrame: null | string;
  thirdFrame: null | string;
  referenceImage1: null | string;
  referenceImage2: null | string;
  referenceImage3: null | string;
  referenceImage4: null | string;
  ratio?: string;
  type?: string;
  time?: string;
  loop?: string;
  camera?: string;
  audio?: string;
  style?: string;
  template?: string;
  // higgsfield
  higgsfieldMix?: boolean;
  higgsfieldMotion1?: string;
  higgsfieldMotion2?: string;
  higgsfieldMotionStrength1?: number;
  higgsfieldMotionStrength2?: number;
  higgsfieldStartFrame?: null | string;
  higgsfieldEndFrame?: null | string;
  higgsfieldPrompt?: string;
  higgsfieldModel?: string;
  higgsfieldTime?: string;
  // vidu v2
  viduV2Model?: string;
  viduV2Type?: string;
  viduV2Prompt?: string;
  viduV2Image?: null | string;
  viduV2StartFrame?: null | string;
  viduV2EndFrame?: null | string;
  viduV2ReferenceImage1?: null | string;
  viduV2ReferenceImage2?: null | string;
  viduV2ReferenceImage3?: null | string;
  viduV2Duration?: string;
  viduV2Resolution?: string;
  viduV2Scene?: string;
  viduV2MovementAmplitude?: string;
  viduV2AspectRatio?: string;
  viduV2Style?: string;
  // kling v2
  klingV2Type?: string;
  klingV2Image?: null | string;
  klingV2Prompt?: string;
  klingV2NegativePrompt?: string;
  klingV2Cfg?: number;
  klingV2AspectRatio?: string;
  klingV2Duration?: string;
  // kling v2.1
  klingV21Type?: string;
  klingV21Version?: string;
  klingV21Image?: null | string;
  klingV21Prompt?: string;
  klingV21NegativePrompt?: string;
  klingV21Cfg?: number;
  klingV21AspectRatio?: string;
  klingV21Duration?: string;
  // veo 3
  veo3Prompt?: string;
  veo3AspectRatio?: string;
  veo3EnhancePrompt?: boolean;
  veo3GenerateAudio?: boolean;
  // veo 3 pro
  veo3ProPrompt?: string;
  // veo 3 pro frames
  veo3ProFramesPrompt?: string;
  veo3ProFramesImage?: null | string;
  // veo 3 fast
  veo3FastPrompt?: string;
  // Seedance
  seedanceType?: string;
  seedanceModel?: string;
  seedanceText?: string;
  seedanceReslution?: string;
  seedanceRatio?: string;
  seedanceWm?: string;
  seedanceCf?: string;
  seedanceImage?: null | string;
  seedanceDuration?: string;
  // MiniMax-Hailuo-02
  minimaxiHailuoPrompt?: string;
  minimaxiHailuoPromptOptimizer?: boolean;
  minimaxiHailuoDuration?: string;
  minimaxiHailuoResolution?: string;
  minimaxiHailuoFirstFrameImage?: null | string;
  // Mj-Video
  mjVideoPrompt?: string;
  mjVideoMotion?: string;
  mjVideoImage?: null | string;
  // Pika
  pikaImage?: null | string;
  pikaPrompt?: string;
  pikaNegativePrompt?: string;
};

type VideoFormtype = {
  disabled?: boolean;
  className?: string;
};

const VideoForm = ({ className, disabled = false }: VideoFormtype) => {
  const addTask = useTaskStore((state) => state.addTask);
  const [isReady, setIsReady] = useState(false);
  const [showFields, setShowFields] = useState<string[]>([]);
  const [isNeedRatio, setIsNeedRatio] = useState(false);
  const [isResize, setIsResize] = useState(false);
  const [ratioOptions, setRatioOptions] = useState<OptionProps[]>(
    OPTION_CONSTANTS.defaultVideoOption
  );
  const { t } = useClientTranslation();

  const isMobile = useIsMobile();

  const videoForm = useFormStore((state) => state.videoFormState.formData);

  const {
    watch,
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<DefaultVideoData>({
    defaultValues: videoForm,
    resolver: zodResolver(VideoSchema),
  });

  const modelValue = watch("model");
  const promptValue = watch("prompt");
  const typeValue = watch("type");
  const firstFile = watch("firstFile");
  const lastFile = watch("lastFile");
  const thirdFile = watch("thirdFile");

  // higgsfield
  const higgsfieldMixValue = watch("higgsfieldMix");
  const higgsfieldMotion1 = watch("higgsfieldMotion1");
  const higgsfieldMotion2 = watch("higgsfieldMotion2");
  const higgsfieldStartFrame = watch("higgsfieldStartFrame");

  // vidu v2
  const viduV2Type = watch("viduV2Type");
  const viduV2Duration = watch("viduV2Duration");
  const viduV2Model = watch("viduV2Model");
  const viduV2Image = watch("viduV2Image");
  const viduV2StartFrame = watch("viduV2StartFrame");
  const viduV2EndFrame = watch("viduV2EndFrame");
  const viduV2ReferenceImage1 = watch("viduV2ReferenceImage1");
  const viduV2Prompt = watch("viduV2Prompt");
  const viduV2Resolution = watch("viduV2Resolution");

  // kling v2
  const klingV2Type = watch("klingV2Type");
  const klingV2Image = watch("klingV2Image");
  const klingV2Prompt = watch("klingV2Prompt");

  // veo 3
  const veo3Prompt = watch("veo3Prompt");
  const veo3AspectRatio = watch("veo3AspectRatio");
  const veo3EnhancePrompt = watch("veo3EnhancePrompt");
  const veo3GenerateAudio = watch("veo3GenerateAudio");

  // Seedance
  const seedanceType = watch("seedanceType");
  const seedanceModel = watch("seedanceModel");
  const seedanceText = watch("seedanceText");
  const seedanceReslution = watch("seedanceReslution");
  const seedanceRatio = watch("seedanceRatio");
  const seedanceWm = watch("seedanceWm");
  const seedanceCf = watch("seedanceCf");
  const seedanceImage = watch("seedanceImage");
  const seedanceDuration = watch("seedanceDuration");

  const [openMotionDialog, setOpenMotionDialog] = useState(false);
  const [currentMotionUrl, setCurrentMotionUrl] = useState<string | null>(null);

  const getSelectOptions = (field: VideoFormProps) => {
    if (modelValue === "vidu_2") {
      if (viduV2Type === "text_to_video") {
        if (field.name === "viduV2Model") {
          return field.selectOptions?.filter(
            (option) => option.value !== "vidu2.0"
          );
        }
        if (field.name === "viduV2Duration") {
          if (viduV2Model === "viduq1") {
            return field.selectOptions?.filter(
              (option) => option.value === "5"
            );
          }
          if (viduV2Model === "vidu1.5") {
            return field.selectOptions?.filter(
              (option) => option.value !== "5"
            );
          }
        }
        if (field.name === "viduV2Resolution") {
          if (viduV2Model === "viduq1") {
            return field.selectOptions?.filter(
              (option) => option.value === "1080p"
            );
          }
          if (viduV2Model === "vidu1.5" && viduV2Duration === "8") {
            return field.selectOptions?.filter(
              (option) => option.value === "720p"
            );
          }
        }
      }
      if (viduV2Type === "image_to_video") {
        if (field.name === "viduV2Duration") {
          if (viduV2Model === "viduq1") {
            return field.selectOptions?.filter(
              (option) => option.value === "5"
            );
          }
          if (viduV2Model === "vidu1.5" || viduV2Model === "vidu2.0") {
            return field.selectOptions?.filter(
              (option) => option.value !== "5"
            );
          }
        }
        if (field.name === "viduV2Resolution") {
          if (viduV2Model === "viduq1") {
            return field.selectOptions?.filter(
              (option) => option.value === "1080p"
            );
          }
          if (
            (viduV2Model === "vidu1.5" || viduV2Model === "vidu2.0") &&
            (viduV2Duration === "8" || viduV2Duration === "8")
          ) {
            return field.selectOptions?.filter(
              (option) => option.value === "720p"
            );
          }
        }
      }
      if (viduV2Type === "head_tail_to_video") {
        if (field.name === "viduV2Duration") {
          if (viduV2Model === "viduq1") {
            return field.selectOptions?.filter(
              (option) => option.value === "5"
            );
          }
          if (viduV2Model === "vidu1.5" || viduV2Model === "vidu2.0") {
            return field.selectOptions?.filter(
              (option) => option.value !== "5"
            );
          }
        }
        if (field.name === "viduV2Resolution") {
          if (viduV2Model === "viduq1") {
            return field.selectOptions?.filter(
              (option) => option.value === "1080p"
            );
          }
          if (
            (viduV2Model === "vidu1.5" || viduV2Model === "vidu2.0") &&
            (viduV2Duration === "8" || viduV2Duration === "8")
          ) {
            return field.selectOptions?.filter(
              (option) => option.value === "720p"
            );
          }
        }
      }
      if (viduV2Type === "character_to_video") {
        if (field.name === "viduV2Model") {
          return field.selectOptions?.filter(
            (option) => option.value !== "viduq1"
          );
        }
        if (field.name === "viduV2Duration") {
          if (viduV2Model === "vidu1.5") {
            return field.selectOptions?.filter(
              (option) => option.value !== "5"
            );
          }
          if (viduV2Model === "vidu2.0") {
            return field.selectOptions?.filter(
              (option) => option.value === "4"
            );
          }
        }
        if (field.name === "viduV2Resolution") {
          if (viduV2Model === "vidu1.5" && viduV2Duration === "8") {
            return field.selectOptions?.filter(
              (option) => option.value === "720p"
            );
          }
          if (viduV2Model === "vidu2.0") {
            return field.selectOptions?.filter(
              (option) => option.value !== "1080p"
            );
          }
        }
      }
    }

    return field.selectOptions;
  };

  useEffect(() => {
    if (viduV2Type === "text_to_video") {
      if (viduV2Model === "vidu2.0") {
        setValue("viduV2Model", "");
      }
      if (viduV2Model === "viduq1") {
        setValue("viduV2Duration", "5");
        setValue("viduV2Resolution", "1080p");
      }
      if (viduV2Model === "vidu1.5") {
        setValue("viduV2Duration", "4");
        setValue("viduV2Resolution", "720p");
      }
    }
  }, [setValue, viduV2Model, viduV2Type]);

  useEffect(() => {
    if (viduV2Type === "image_to_video") {
      if (viduV2Model === "viduq1") {
        setValue("viduV2Duration", "5");
        setValue("viduV2Resolution", "1080p");
      }
      if (viduV2Model === "vidu1.5" || viduV2Model === "vidu2.0") {
        setValue("viduV2Duration", "4");
        setValue("viduV2Resolution", "720p");
      }
    }
  }, [setValue, viduV2Model, viduV2Type]);

  useEffect(() => {
    if (viduV2Type === "head_tail_to_video") {
      if (viduV2Model === "viduq1") {
        setValue("viduV2Duration", "5");
        setValue("viduV2Resolution", "1080p");
      }
      if (viduV2Model === "vidu1.5" || viduV2Model === "vidu2.0") {
        setValue("viduV2Duration", "4");
        setValue("viduV2Resolution", "720p");
      }
    }
  }, [setValue, viduV2Model, viduV2Type]);

  useEffect(() => {
    if (viduV2Type === "character_to_video") {
      if (viduV2Model) {
        setValue("viduV2Duration", "4");
        setValue("viduV2Resolution", "720p");
      }
    }
  }, [setValue, viduV2Type, viduV2Model]);

  // Reset Files
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    switch (modelValue) {
      case "luma":
        setRatioOptions(OPTION_CONSTANTS.lumaVideoOption);
        setShowFields([
          "model",
          "prompt",
          "firstFile",
          "firstFrame",
          "lastFile",
          "lastFrame",
          "camera",
          "loop",
        ]);
        break;
      case "kling_15": {
        setRatioOptions(OPTION_CONSTANTS.klingVideoOption);
        const baseFields = [
          "model",
          "prompt",
          "firstFile",
          "firstFrame",
          "ratio",
          "type",
          "time",
        ];
        const referenceFields = [
          "referenceImage1",
          "referenceImage2",
          "referenceImage3",
          "referenceImage4",
        ];
        const lastFields = ["lastFile", "lastFrame"];

        if (typeValue === "fast") {
          setShowFields(
            firstFile ? baseFields : [...baseFields, ...referenceFields]
          );
        } else {
          setShowFields(
            firstFile
              ? [...baseFields, ...lastFields]
              : [...baseFields, ...lastFields, ...referenceFields]
          );
        }
        break;
      }
      case "kling": {
        setRatioOptions(OPTION_CONSTANTS.klingVideoOption);
        const fields = [
          "model",
          "prompt",
          "firstFile",
          "firstFrame",
          "ratio",
          "type",
          "time",
        ];
        if (!firstFile) {
          fields.push(
            "referenceImage1",
            "referenceImage2",
            "referenceImage3",
            "referenceImage4"
          );
        }
        setShowFields(fields);
        break;
      }
      case "runway":
        setRatioOptions(OPTION_CONSTANTS.runwayVideoOption);
        if (firstFile || lastFile) {
          setShowFields([
            "model",
            "prompt",
            "firstFile",
            "firstFrame",
            "lastFile",
            "lastFrame",
            "type",
            "time",
          ]);
        } else {
          setShowFields([
            "model",
            "prompt",
            "firstFile",
            "firstFrame",
            "lastFile",
            "lastFrame",
            "time",
          ]);
        }
        break;
      case "cog":
        setRatioOptions(OPTION_CONSTANTS.cogVideoOption);
        // setShowFields(["model", "prompt", "firstFile", "firstFrame"]);
        if (firstFile) {
          setShowFields([
            "model",
            "prompt",
            "firstFile",
            "firstFrame",
            "type",
            "audio",
            "time",
            "ratio",
          ]);
        } else {
          setShowFields([
            "model",
            "prompt",
            "firstFile",
            "firstFrame",
            "type",
            "audio",
            "ratio",
          ]);
        }
        break;
      case "minimax":
        setRatioOptions(OPTION_CONSTANTS.minimaxVideoOption);
        setShowFields(["model", "prompt", "firstFile", "firstFrame"]);
        break;
      case "minimax_live2d":
        setRatioOptions(OPTION_CONSTANTS.minimaxVideoOption);
        setShowFields(["model", "prompt", "firstFile", "firstFrame"]);
        break;
      case "minimax_s2v01":
        setRatioOptions(OPTION_CONSTANTS.minimaxVideoOption);
        setShowFields(["model", "prompt", "firstFile", "firstFrame"]);
        break;
      case "genmo":
        setShowFields(["model", "prompt"]);
        break;
      case "haiper":
        setRatioOptions(OPTION_CONSTANTS.haiperVideoOption);
        setShowFields(["model", "prompt", "firstFile", "firstFrame"]);
        break;
      case "pixverse":
        setRatioOptions(OPTION_CONSTANTS.pixverseVideoOption);
        setShowFields([
          "model",
          "prompt",
          "firstFile",
          "firstFrame",
          "template",
        ]);
        break;
      case "lightricks":
        setRatioOptions(OPTION_CONSTANTS.lightricksVideoOption);
        setShowFields(["model", "prompt", "firstFile", "firstFrame"]);
        break;
      case "hunyuan":
        setShowFields(["model", "prompt"]);
        break;
      case "wanx_turbo":
        setRatioOptions(OPTION_CONSTANTS.wanxVideoOption);
        setShowFields(["model", "prompt", "ratio"]);
        break;
      case "wanx_plus":
        setRatioOptions(OPTION_CONSTANTS.wanxVideoOption);
        setShowFields(["model", "prompt", "ratio"]);
        break;
      case "seaweed":
        setRatioOptions(OPTION_CONSTANTS.seaweedVideoOption);
        setShowFields(["model", "prompt", "firstFile", "firstFrame", "ratio"]);
        break;
      case "higgsfield": {
        const fields = [
          "model",
          "higgsfieldMix",
          "higgsfieldMotion1",
          ...(higgsfieldMixValue
            ? [
                "higgsfieldMotion2",
                "higgsfieldMotionStrength1",
                "higgsfieldMotionStrength2",
              ]
            : ""),
          "higgsfieldStartFrame",
          "higgsfieldEndFrame",
          "higgsfieldPrompt",
          "higgsfieldModel",
          "higgsfieldTime",
        ];
        setShowFields(fields);
        break;
      }
      case "vidu_2": {
        let fields = [];
        if (viduV2Type === "scene_to_video") {
          fields = [
            "model",
            "viduV2Type",
            "viduV2Scene",
            "viduV2Image",
            "viduV2Prompt",
          ];
        } else {
          fields = [
            "model",
            "viduV2Type",
            "viduV2Prompt",
            ...(viduV2Type === "text_to_video"
              ? [
                  "viduV2Model",
                  "viduV2Duration",
                  "viduV2AspectRatio",
                  "viduV2Resolution",
                  "viduV2MovementAmplitude",
                  "viduV2Style",
                ]
              : ""),
            ...(viduV2Type === "image_to_video"
              ? ["viduV2Model", "viduV2Image", "viduV2Duration"]
              : ""),
            ...(viduV2Type === "head_tail_to_video"
              ? [
                  "viduV2Model",
                  "viduV2StartFrame",
                  "viduV2EndFrame",
                  "viduV2Duration",
                ]
              : ""),
            ...(viduV2Type === "character_to_video"
              ? [
                  "viduV2Model",
                  "viduV2ReferenceImage1",
                  "viduV2ReferenceImage2",
                  "viduV2ReferenceImage3",
                  "viduV2AspectRatio",
                  "viduV2Duration",
                ]
              : ""),
            "viduV2Resolution",
            "viduV2MovementAmplitude",
          ];
        }

        setShowFields(fields);
        break;
      }
      case "kling_2": {
        // setRatioOptions(OPTION_CONSTANTS.klingVideoOption);
        const fields = [
          "model",
          "klingV2Type",
          klingV2Type === "image_to_video" ? "klingV2Image" : "",
          "klingV2Prompt",
          "klingV2NegativePrompt",
          "klingV2Cfg",
          "klingV2AspectRatio",
          klingV2Type === "image_to_video" ? "klingV2Duration" : "",
        ];
        setShowFields(fields);
        break;
      }
      case "veo3": {
        setShowFields([
          "model",
          "veo3Prompt",
          "veo3AspectRatio",
          "veo3EnhancePrompt",
          "veo3GenerateAudio",
        ]);
        break;
      }
      case "seedance": {
        const fields = [
          "model",
          "seedanceType",
          "seedanceModel",
          "seedanceText",
          "seedanceDuration",
          "seedanceReslution",
          "seedanceWm",
          "seedanceCf",
        ];
        if (seedanceType === "image_to_video") {
          fields.push("seedanceImage");
        } else {
          fields.push("seedanceRatio");
        }
        setShowFields(fields);
        break;
      }
      default:
        setRatioOptions(OPTION_CONSTANTS.defaultVideoOption);
        setShowFields([
          "model",
          "prompt",
          "firstFile",
          "lastFile",
          "firstFrame",
          "lastFrame",
          "ratio",
          "type",
          "time",
          "loop",
          "audio",
          "camera",
          "style",
          "template",
        ]);
        break;
    }
  }, [
    modelValue,
    promptValue,
    typeValue,
    firstFile,
    lastFile,
    setValue,
    setRatioOptions,
    higgsfieldMixValue,
    viduV2Type,
    viduV2Duration,
    viduV2Model,
    klingV2Type,
    seedanceType,
  ]);

  // Reset Frame
  useEffect(() => {
    if (!firstFile) setValue("firstFrame", null);
    if (!lastFile) setValue("lastFrame", null);
    if (!thirdFile) setValue("thirdFrame", null);
  }, [firstFile, lastFile, thirdFile, setValue]);

  // Set Ratio
  useEffect(() => {
    if (
      [
        "kling_15",
        "kling",
        "vidu",
        "wanx_turbo",
        "wanx_plus",
        "seaweed",
      ].includes(modelValue) ||
      (showFields.includes("firstFile") && firstFile) ||
      (showFields.includes("lastFile") && lastFile) ||
      (showFields.includes("thirdFile") && thirdFile)
    ) {
      setIsNeedRatio(true);
    } else {
      setIsNeedRatio(false);
    }
  }, [modelValue, firstFile, lastFile, thirdFile, showFields]);

  // Set Resize
  useEffect(() => {
    setIsResize(modelValue === "runway");
  }, [modelValue]);

  // Set Ready
  useEffect(() => {
    if (["pixverse", "minimax_live2d", "minimax_s2v01"].includes(modelValue)) {
      setIsReady(!!firstFile);
    } else if (modelValue === "higgsfield") {
      if (higgsfieldMixValue) {
        setIsReady(
          !!(higgsfieldStartFrame && higgsfieldMotion1 && higgsfieldMotion2)
        );
      } else {
        setIsReady(!!(higgsfieldStartFrame && higgsfieldMotion1));
      }
    } else if (modelValue === "vidu_2") {
      switch (viduV2Type) {
        case "text_to_video":
          setIsReady(
            !!(
              viduV2Model &&
              viduV2Duration &&
              viduV2Prompt &&
              viduV2Resolution
            )
          );
          break;
        case "image_to_video":
          setIsReady(
            !!(viduV2Model && viduV2Image && viduV2Duration && viduV2Resolution)
          );
          break;
        case "head_tail_to_video":
          setIsReady(
            !!(
              viduV2Model &&
              viduV2StartFrame &&
              viduV2EndFrame &&
              viduV2Duration &&
              viduV2Resolution
            )
          );
          break;
        case "character_to_video":
          setIsReady(
            !!(
              viduV2Model &&
              viduV2ReferenceImage1 &&
              viduV2Prompt &&
              viduV2Duration &&
              viduV2Resolution
            )
          );
          break;
        case "scene_to_video":
          setIsReady(!!(viduV2Model && viduV2Image && viduV2Prompt));
          break;
        default:
          setIsReady(false);
      }
    } else if (modelValue === "kling_2") {
      if (klingV2Type === "image_to_video") {
        setIsReady(!!klingV2Image);
      } else {
        setIsReady(!!klingV2Prompt);
      }
    } else if (modelValue === "veo3") {
      setIsReady(!!veo3Prompt && !!veo3AspectRatio);
    } else if (modelValue === "seedance") {
      if (seedanceType === "image_to_video") {
        setIsReady(
          !!(
            seedanceImage &&
            seedanceModel &&
            seedanceText &&
            seedanceReslution &&
            seedanceWm &&
            seedanceCf &&
            seedanceDuration
          )
        );
      } else {
        setIsReady(
          !!(
            seedanceModel &&
            seedanceText &&
            seedanceReslution &&
            seedanceRatio &&
            seedanceWm &&
            seedanceCf &&
            seedanceDuration
          )
        );
      }
    } else {
      setIsReady(!!(firstFile || lastFile || promptValue));
    }
  }, [
    firstFile,
    lastFile,
    promptValue,
    modelValue,
    higgsfieldMixValue,
    higgsfieldStartFrame,
    higgsfieldMotion1,
    higgsfieldMotion2,
    viduV2Type,
    viduV2Model,
    viduV2Duration,
    viduV2Prompt,
    viduV2Resolution,
    viduV2Image,
    viduV2StartFrame,
    viduV2EndFrame,
    viduV2ReferenceImage1,
    klingV2Type,
    klingV2Image,
    klingV2Prompt,
    veo3Prompt,
    veo3AspectRatio,
    veo3EnhancePrompt,
    veo3GenerateAudio,
    seedanceText,
    seedanceReslution,
    seedanceRatio,
    seedanceWm,
    seedanceCf,
    seedanceType,
    seedanceImage,
    seedanceDuration,
    seedanceModel,
  ]);

  // Set Fromdata
  useEffect(() => {
    Object.entries(videoForm).forEach(([key, value]) =>
      setValue(key as VideoFormKey, value)
    );
  }, [videoForm, setValue]);

  // Handle form submit
  const _onSubmit = (data: DefaultVideoData) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => showFields.includes(key))
    );
    console.log("filteredData:::", filteredData);
    addTask(filteredData, TaskType.VIDEO_GENERATION);
  };

  // Handle crop submit
  const handleCropConfirm = (data: {
    firstFrame: string | null;
    lastFrame: string | null;
    thirdFrame: string | null;
    ratio: string;
  }) => {
    Object.entries(data).forEach(([key, value]) =>
      setValue(key as VideoFormKey, value)
    );

    handleSubmit(
      (data) => {
        console.log("验证成功，调用 _onSubmit:", data);
        _onSubmit(data);
      },
      (errors) => {
        console.log("表单验证失败:", errors);
      }
    )();
  };

  // 添加一个函数来获取正确的标签
  const getFieldLabel = (fieldName: string) => {
    // 在minimax_s2v01模型时才改变标签
    if (modelValue === "minimax_s2v01") {
      if (fieldName === "firstFile" || fieldName === "firstFrame") {
        return {
          label: "v-gen:form.main_image.title",
          placeholder: "v-gen:form.main_image.desc",
        };
      }
    }

    // 其他情况使用默认标签
    if (fieldName === "firstFile" || fieldName === "firstFrame") {
      return {
        label: "v-gen:form.first_frame.title",
        placeholder: "v-gen:form.first_frame.desc",
      };
    }
    if (fieldName === "lastFile" || fieldName === "lastFrame") {
      return {
        label: "v-gen:form.last_frame.title",
        placeholder: "v-gen:form.last_frame.desc",
      };
    }
    if (fieldName === "thirdFile" || fieldName === "thirdFrame") {
      return {
        label: "v-gen:form.third_frame.title",
        placeholder: "v-gen:form.third_frame.desc",
      };
    }
    return null;
  };

  // 添加一个函数来确定是否显示字段
  const shouldShowField = (fieldName: string) => {
    // 首先检查字段是否在允许显示的字段列表中
    if (!showFields.includes(fieldName)) {
      return false;
    }
    return true;
  };

  // Get the motion URL based on the motion name
  const getMotionImageUrl = (motionName: string | null | undefined) => {
    if (!motionName) return null;

    // Find the motion option in the VIDEO_HIGGSFIELD_MOTION_OPTION array
    const motionOption = VIDEO_HIGGSFIELD_MOTION_OPTION.find(
      (option) => option.value === motionName
    );

    // Return the payload image URL if found
    return motionOption?.payload?.image || null;
  };

  // Handle eye button click
  const handleShowMotionImage = (
    motionField: "higgsfieldMotion1" | "higgsfieldMotion2"
  ) => {
    const motionValue = getValues(motionField);
    if (motionValue) {
      setCurrentMotionUrl(getMotionImageUrl(motionValue));
      setOpenMotionDialog(true);
    }
  };

  const isNewModel = [
    "veo3_pro_frames",
    "veo3_fast",
    "veo3_pro",
    "mj_video",
    "pika",
    "minimaxi_hailuo_02",
    "kling_21",
  ].includes(modelValue);

  return (
    <form
      className={cn("grid w-full items-center gap-4", className)}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(
          (data) => {
            console.log("验证成功，调用 _onSubmit:", data);
            _onSubmit(data);
          },
          (errors) => {
            console.log("表单验证失败:", errors);
          }
        )();
      }}
    >
      <FormGenerator
        name="model"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.model.title")}
        placeholder={t("v-gen:form.model.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="select"
        selectOptions={VIDEO_MODEL_OPTION}
      />

      <KlingV21Form
        modelValue={modelValue}
        setIsReady={setIsReady}
        setShowFields={setShowFields}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
      />

      <MinimaxHailuo02Form
        modelValue={modelValue}
        setIsReady={setIsReady}
        setShowFields={setShowFields}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
      />

      <PikaForm
        modelValue={modelValue}
        setIsReady={setIsReady}
        setShowFields={setShowFields}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
      />

      <Veo3ProForm
        modelValue={modelValue}
        setIsReady={setIsReady}
        setShowFields={setShowFields}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
      />

      <Veo3ProFramesForm
        modelValue={modelValue}
        setIsReady={setIsReady}
        setShowFields={setShowFields}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
      />

      <Veo3FastForm
        modelValue={modelValue}
        setIsReady={setIsReady}
        setShowFields={setShowFields}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
      />

      <MJVideoForm
        modelValue={modelValue}
        setIsReady={setIsReady}
        setShowFields={setShowFields}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
      />

      {!isNewModel &&
        FORM_CONSTANTS.videoForm.map((field) => {
          const customLabel = getFieldLabel(field.name);
          return (
            <div
              key={field.id}
              className={cn("flex flex-row items-end justify-between gap-2", {
                hidden: !shouldShowField(field.name),
              })}
            >
              <FormGenerator
                {...field}
                watch={watch}
                register={register}
                getValues={getValues}
                setValue={setValue}
                errors={errors}
                label={customLabel?.label || field.label}
                placeholder={customLabel?.placeholder || field.placeholder}
                className={cn("flex w-full flex-col space-y-2", {
                  "space-y-7": field.type === "slider",
                })}
                selectOptions={getSelectOptions(field)}
                selectConfig={field.selectConfig}
              />

              {isMobile && (
                <Button
                  variant="outline"
                  type="button"
                  size="icon"
                  className={cn("shrink-0", {
                    hidden:
                      field.name !== "higgsfieldMotion1" &&
                      field.name !== "higgsfieldMotion2",
                  })}
                  disabled={
                    !getValues(
                      field.name as "higgsfieldMotion1" | "higgsfieldMotion2"
                    )
                  }
                  onClick={() =>
                    handleShowMotionImage(
                      field.name as "higgsfieldMotion1" | "higgsfieldMotion2"
                    )
                  }
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}

      {/* Dialog for displaying motion images */}
      <Dialog open={openMotionDialog} onOpenChange={setOpenMotionDialog}>
        <DialogTitle className="hidden" />
        <DialogContent className="sm:max-w-[425px]">
          {currentMotionUrl && (
            <div className="flex flex-col items-center justify-center">
              <img
                src={currentMotionUrl}
                alt="Motion Preview"
                className="max-h-[80vh] w-auto object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      {isNeedRatio ? (
        <ImageCropper
          disable={disabled || !isReady}
          ratioOptions={ratioOptions}
          originFirstUrl={showFields.includes("firstFile") ? firstFile : null}
          originLastUrl={showFields.includes("lastFile") ? lastFile : null}
          originThirdUrl={showFields.includes("thirdFile") ? thirdFile : null}
          resize={isResize}
          confirm={handleCropConfirm}
        />
      ) : (
        <Button disabled={disabled || !isReady} type="submit">
          {t("v-gen:action.create_video")}
        </Button>
      )}
    </form>
  );
};

export default VideoForm;
