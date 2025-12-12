import type { StateCreator } from "zustand";

export interface VideoFormData {
  model: string;
  prompt?: string;
  firstFile?: null | string;
  lastFile?: null | string;
  firstFrame?: null | string;
  lastFrame?: null | string;
  raio?: string;
  type?: string;
  time?: string;
  loop?: string;
  camera?: string;
  audio?: string;
  style?: string;
  template?: string;
  viduType?: string;
  viduStyle?: string;
  viduTime?: string;
  viduResolution?: string;
  viduScene?: string;
  // Higgsfield
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
  seedanceText?: string;
  seedanceModel?: string;
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
  // Pika
  pikaImage?: null | string;
  pikaPrompt?: string;
  pikaNegativePrompt?: string;
  pikaAffects?: string;
}

interface FormDefaults {
  videoForm: VideoFormData;
}

interface VideoFormState {
  formData: VideoFormData;
  resetToDefault: () => void;
  setFormData: (data: Partial<VideoFormData>) => void;
}

export interface FormStore extends FormDefaults {
  videoFormState: VideoFormState;
}

const defaultValues: FormDefaults = {
  videoForm: {
    model: "seedance",
    prompt: "",
    type: "fast",
    time: "5s",
    loop: "false",
    audio: "false",
    camera: "none",
    style: "none",
    template: "303624537709312",
    viduType: "general",
    viduStyle: "general",
    viduTime: "4",
    viduResolution: "512",
    viduScene: "hug",
    // Higgsfield
    higgsfieldMix: false,
    higgsfieldMotion1: "",
    higgsfieldMotion2: "",
    higgsfieldMotionStrength1: 0.85,
    higgsfieldMotionStrength2: 0.85,
    higgsfieldStartFrame: null,
    higgsfieldEndFrame: null,
    higgsfieldPrompt: "",
    higgsfieldModel: "standard",
    higgsfieldTime: "3s",
    // vidu v2
    viduV2Model: "",
    viduV2Type: "",
    viduV2Prompt: "",
    viduV2Image: null,
    viduV2StartFrame: null,
    viduV2EndFrame: null,
    viduV2ReferenceImage1: null,
    viduV2ReferenceImage2: null,
    viduV2ReferenceImage3: null,
    viduV2Duration: "",
    viduV2Resolution: "",
    viduV2Scene: "hug",
    viduV2MovementAmplitude: "auto",
    viduV2AspectRatio: "16:9",
    viduV2Style: "general",
    // kling v2
    klingV2Type: "text_to_video",
    klingV2Image: null,
    klingV2Prompt: "",
    klingV2NegativePrompt: "",
    klingV2Cfg: 0.5,
    klingV2AspectRatio: "1:1",
    klingV2Duration: "5",
    // kling v2.1
    klingV21Type: "image_to_video",
    klingV21Version: "master",
    klingV21Image: null,
    klingV21Prompt: "",
    klingV21NegativePrompt: "",
    klingV21Cfg: 0.5,
    klingV21AspectRatio: "1:1",
    klingV21Duration: "5",
    // veo 3
    veo3Prompt: "",
    veo3AspectRatio: "",
    veo3EnhancePrompt: true,
    veo3GenerateAudio: true,
    // veo 3 pro
    veo3ProPrompt: "",
    // veo 3 pro frames
    veo3ProFramesPrompt: "",
    veo3ProFramesImage: null,
    // veo 3 fast
    veo3FastPrompt: "",
    // Seedance
    seedanceType: "text_to_video",
    seedanceText: "",
    seedanceModel: "",
    seedanceReslution: "",
    seedanceRatio: "",
    seedanceWm: "",
    seedanceCf: "",
    seedanceImage: null,
    seedanceDuration: "",
    // MiniMax-Hailuo-02
    minimaxiHailuoPrompt: "",
    minimaxiHailuoPromptOptimizer: true,
    minimaxiHailuoDuration: "",
    minimaxiHailuoResolution: "",
    minimaxiHailuoFirstFrameImage: null,
    // Pika
    pikaImage: null,
    pikaPrompt: "",
    pikaNegativePrompt: "",
    pikaAffects: "",
  },
};

export const createFormSlice: StateCreator<FormStore, [], [], FormStore> = (
  set
) => ({
  videoForm: defaultValues.videoForm,
  videoFormState: {
    formData: { ...defaultValues.videoForm },
    resetToDefault: () =>
      set((state) => ({
        videoFormState: {
          ...state.videoFormState,
          formData: { ...defaultValues.videoForm },
        },
      })),
    setFormData: (data) =>
      set((state) => ({
        videoFormState: {
          ...state.videoFormState,
          formData: { ...defaultValues.videoForm, ...data },
        },
      })),
  },
});
