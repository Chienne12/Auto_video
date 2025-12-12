import { nanoid } from "nanoid";

import {
  VIDEO_AUDIO_OPTION,
  VIDEO_CAMERA_OPTION,
  VIDEO_HIGGSFIELD_MODEL_OPTION,
  VIDEO_HIGGSFIELD_MOTION_OPTION,
  VIDEO_HIGGSFIELD_TIME_OPTION,
  VIDEO_LOOP_OPTION,
  VIDEO_STYLE_OPTION,
  VIDEO_TEMPLATE_OPTION,
  VIDEO_TIME_OPTION,
  VIDEO_TYPE_OPTION,
  VIDU_RESOLUTION_OPTION,
  VIDU_SCENE_OPTION,
  VIDU_STYLE_OPTION,
  VIDU_TIME_OPTION,
  VIDU_TYPE_OPTION,
  VIDU_V2_MOVEMENT_AMPLITUDE_OPTION,
} from "./options";

type LabelConfig = {
  top?: string;
  bottom?: string;
};

type StepLabel = {
  value: number;
  topLabel?: string;
  bottomLabel?: string;
};

type SliderConfig = {
  min: number;
  max: number;
  step?: number;
  showMinLabel?: boolean;
  showMaxLabel?: boolean;
  minLabel?: string | LabelConfig;
  maxLabel?: string | LabelConfig;
  stepLabels?: StepLabel[];
  fixedValues?: { value: number; label: string }[];
  tooltip?: string;
  formatValue?: (value: number) => string;
  showCurrentValue?: boolean;
};

type SelectConfig = {
  showImage?: boolean;
};

export type AuthFormProps = {
  id: number;
  name: string;
  label?: string;
  placeholder?: string;
  type: "input" | "checkbox";
  inputType?: "text" | "password";
  selectOptions?: { value: string; label: string; id: number }[];
};

export const SIGN_IN_FORM: AuthFormProps[] = [
  {
    id: 1,
    name: "code",
    type: "input",
    inputType: "password",
    placeholder: "auth:form.input_code",
    label: "",
  },
  {
    id: 2,
    name: "remember",
    type: "checkbox",
    label: "auth:form.remember_code",
  },
];

export type VideoFormProps = {
  id: number | string;
  name: string;
  label?: string;
  placeholder?: string;
  type:
    | "select"
    | "input"
    | "textarea"
    | "checkbox"
    | "upload"
    | "switch"
    | "slider";
  inputType?: "text" | "email" | "password" | "number" | "checkbox";
  textareaRows?: number;
  selectOptions?: { value: string; label: string; id: number | string }[];
  sliderConfig?: SliderConfig;
  selectConfig?: SelectConfig;
};

export const VIDEO_FORM: VideoFormProps[] = [
  // {
  //   id: 1,
  //   name: "model",
  //   label: "v-gen:form.model.title",
  //   placeholder: "v-gen:form.model.desc",
  //   type: "select",
  //   selectOptions: VIDEO_MODEL_OPTION,
  // },
  {
    id: 2,
    name: "prompt",
    label: "v-gen:form.prompt.title",
    placeholder: "v-gen:form.prompt.desc",
    type: "textarea",
    textareaRows: 3,
  },
  {
    id: 3,
    name: "firstFile",
    label: "v-gen:form.first_frame.title",
    placeholder: "v-gen:form.first_frame.desc",
    type: "upload",
  },
  {
    id: 4,
    name: "lastFile",
    label: "v-gen:form.last_frame.title",
    placeholder: "v-gen:form.last_frame.desc",
    type: "upload",
  },
  {
    id: 5,
    name: "thirdFile",
    label: "v-gen:form.third_frame.title",
    placeholder: "v-gen:form.third_frame.desc",
    type: "upload",
  },
  {
    id: 6,
    name: "type",
    label: "v-gen:form.type.title",
    placeholder: "v-gen:form.type.desc",
    type: "select",
    selectOptions: VIDEO_TYPE_OPTION,
  },
  {
    id: 7,
    name: "time",
    label: "v-gen:form.time.title",
    placeholder: "v-gen:form.time.desc",
    type: "select",
    selectOptions: VIDEO_TIME_OPTION,
  },
  {
    id: 8,
    name: "loop",
    label: "v-gen:form.loop.title",
    placeholder: "v-gen:form.loop.desc",
    type: "select",
    selectOptions: VIDEO_LOOP_OPTION,
  },
  {
    id: 9,
    name: "audio",
    label: "v-gen:form.audio.title",
    placeholder: "v-gen:form.audio.desc",
    type: "select",
    selectOptions: VIDEO_AUDIO_OPTION,
  },
  {
    id: 10,
    name: "camera",
    label: "v-gen:form.camera.title",
    placeholder: "v-gen:form.camera.desc",
    type: "select",
    selectOptions: VIDEO_CAMERA_OPTION,
  },
  {
    id: 11,
    name: "style",
    label: "v-gen:form.style.title",
    placeholder: "v-gen:form.style.desc",
    type: "select",
    selectOptions: VIDEO_STYLE_OPTION,
  },
  {
    id: 12,
    name: "template",
    label: "v-gen:form.template.title",
    placeholder: "v-gen:form.template.desc",
    type: "select",
    selectOptions: VIDEO_TEMPLATE_OPTION,
  },
  {
    id: 13,
    name: "viduType",
    label: "v-gen:form.vidu_type.title",
    placeholder: "v-gen:form.vidu_type.desc",
    type: "select",
    selectOptions: VIDU_TYPE_OPTION,
  },
  {
    id: 14,
    name: "viduStyle",
    label: "v-gen:form.vidu_style.title",
    placeholder: "v-gen:form.vidu_style.desc",
    type: "select",
    selectOptions: VIDU_STYLE_OPTION,
  },
  {
    id: 15,
    name: "viduTime",
    label: "v-gen:form.vidu_time.title",
    placeholder: "v-gen:form.vidu_time.desc",
    type: "select",
    selectOptions: VIDU_TIME_OPTION,
  },
  {
    id: 16,
    name: "viduResolution",
    label: "v-gen:form.vidu_resolution.title",
    placeholder: "v-gen:form.vidu_resolution.desc",
    type: "select",
    selectOptions: VIDU_RESOLUTION_OPTION,
  },
  {
    id: 17,
    name: "viduScene",
    label: "v-gen:form.vidu_scene.title",
    placeholder: "v-gen:form.vidu_scene.desc",
    type: "select",
    selectOptions: VIDU_SCENE_OPTION,
  },
  {
    id: 18,
    name: "referenceImage1",
    label: "v-gen:form.reference_image1.title",
    placeholder: "v-gen:form.reference_image1.desc",
    type: "upload",
  },
  {
    id: 19,
    name: "referenceImage2",
    label: "v-gen:form.reference_image2.title",
    placeholder: "v-gen:form.reference_image2.desc",
    type: "upload",
  },
  {
    id: 20,
    name: "referenceImage3",
    label: "v-gen:form.reference_image3.title",
    placeholder: "v-gen:form.reference_image3.desc",
    type: "upload",
  },
  {
    id: 21,
    name: "referenceImage4",
    label: "v-gen:form.reference_image4.title",
    placeholder: "v-gen:form.reference_image4.desc",
    type: "upload",
  },
  /****************************************************** Higgsfield ******************************************************/
  {
    id: 22,
    name: "higgsfieldMix",
    label: "v-gen:form.higgsfield_mix.title",
    placeholder: "v-gen:form.higgsfield_mix.desc",
    type: "switch",
  },
  {
    id: 23,
    name: "higgsfieldMotion1",
    label: "v-gen:form.higgsfield_motion.title1",
    placeholder: "v-gen:form.higgsfield_motion.desc",
    type: "select",
    selectOptions: VIDEO_HIGGSFIELD_MOTION_OPTION,
    selectConfig: {
      showImage: true,
    },
  },
  {
    id: 24,
    name: "higgsfieldMotionStrength1",
    label: "v-gen:form.higgsfield_motion_strength.title",
    type: "slider",
    sliderConfig: {
      min: 0.0,
      max: 1.0,
      step: 0.01,
      showCurrentValue: true,
    },
  },
  {
    id: 25,
    name: "higgsfieldMotion2",
    label: "v-gen:form.higgsfield_motion.title2",
    placeholder: "v-gen:form.higgsfield_motion.desc",
    type: "select",
    selectOptions: VIDEO_HIGGSFIELD_MOTION_OPTION,
    selectConfig: {
      showImage: true,
    },
  },
  {
    id: 26,
    name: "higgsfieldMotionStrength2",
    label: "v-gen:form.higgsfield_motion_strength.title",
    type: "slider",
    sliderConfig: {
      min: 0.0,
      max: 1.0,
      step: 0.01,
      showCurrentValue: true,
    },
  },
  {
    id: 27,
    name: "higgsfieldStartFrame",
    label: "v-gen:form.higgsfield_start_frame.title",
    placeholder: "v-gen:form.higgsfield_start_frame.desc",
    type: "upload",
  },
  {
    id: 28,
    name: "higgsfieldEndFrame",
    label: "v-gen:form.higgsfield_end_frame.title",
    placeholder: "v-gen:form.higgsfield_end_frame.desc",
    type: "upload",
  },
  {
    id: 29,
    name: "higgsfieldPrompt",
    label: "v-gen:form.higgsfield_prompt.title",
    placeholder: "v-gen:form.higgsfield_prompt.desc",
    type: "textarea",
    textareaRows: 3,
  },
  {
    id: 30,
    name: "higgsfieldModel",
    label: "v-gen:form.higgsfield_model.title",
    placeholder: "v-gen:form.higgsfield_model.desc",
    type: "select",
    selectOptions: VIDEO_HIGGSFIELD_MODEL_OPTION,
  },
  {
    id: 31,
    name: "higgsfieldTime",
    label: "v-gen:form.time.title",
    placeholder: "v-gen:form.time.desc",
    type: "select",
    selectOptions: VIDEO_HIGGSFIELD_TIME_OPTION,
  },
  /****************************************************** Vidu V2 ******************************************************/

  {
    id: nanoid(),
    name: "viduV2Type",
    label: "v-gen:form.vidu_v2_type.title",
    placeholder: "v-gen:form.vidu_v2_type.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.vidu_v2_type.option.text_to_video",
        value: "text_to_video",
      },
      {
        id: nanoid(),
        label: "v-gen:form.vidu_v2_type.option.image_to_video",
        value: "image_to_video",
      },
      {
        id: nanoid(),
        label: "v-gen:form.vidu_v2_type.option.head_tail_to_video",
        value: "head_tail_to_video",
      },
      {
        id: nanoid(),
        label: "v-gen:form.vidu_v2_type.option.character_to_video",
        value: "character_to_video",
      },
      // {
      //   id: nanoid(),
      //   label: "v-gen:form.vidu_v2_type.option.scene_to_video",
      //   value: "scene_to_video",
      // },
    ],
  },
  {
    id: nanoid(),
    name: "viduV2Model",
    label: "v-gen:form.vidu_v2_model.title",
    placeholder: "v-gen:form.vidu_v2_model.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.vidu_v2_model.option.viduq1",
        value: "viduq1",
      },
      {
        id: nanoid(),
        label: "v-gen:form.vidu_v2_model.option.vidu2",
        value: "vidu2.0",
      },
      {
        id: nanoid(),
        label: "v-gen:form.vidu_v2_model.option.vidu1_5",
        value: "vidu1.5",
      },
    ],
  },
  {
    id: nanoid(),
    name: "viduV2Prompt",
    label: "v-gen:form.prompt.title",
    placeholder: "v-gen:form.prompt.desc",
    type: "textarea",
    textareaRows: 3,
  },
  {
    id: nanoid(),
    name: "viduV2Image",
    label: "v-gen:form.vidu_v2_image.title",
    placeholder: "v-gen:form.vidu_v2_image.desc",
    type: "upload",
  },
  {
    id: nanoid(),
    name: "viduV2StartFrame",
    label: "v-gen:form.vidu_v2_start_frame.title",
    placeholder: "v-gen:form.vidu_v2_start_frame.desc",
    type: "upload",
  },
  {
    id: nanoid(),
    name: "viduV2EndFrame",
    label: "v-gen:form.vidu_v2_end_frame.title",
    placeholder: "v-gen:form.vidu_v2_end_frame.desc",
    type: "upload",
  },
  {
    id: nanoid(),
    name: "viduV2ReferenceImage1",
    label: "v-gen:form.vidu_v2_reference_image1.title",
    placeholder: "v-gen:form.vidu_v2_reference_image1.desc",
    type: "upload",
  },
  {
    id: nanoid(),
    name: "viduV2ReferenceImage2",
    label: "v-gen:form.vidu_v2_reference_image2.title",
    placeholder: "v-gen:form.vidu_v2_reference_image2.desc",
    type: "upload",
  },
  {
    id: nanoid(),
    name: "viduV2ReferenceImage3",
    label: "v-gen:form.vidu_v2_reference_image3.title",
    placeholder: "v-gen:form.vidu_v2_reference_image3.desc",
    type: "upload",
  },
  {
    id: nanoid(),
    name: "viduV2Duration",
    label: "v-gen:form.vidu_v2_time.title",
    placeholder: "v-gen:form.vidu_v2_time.desc",
    type: "select",
    selectOptions: [
      { id: 1, label: "v-gen:form.vidu_v2_time.option.4", value: "4" },
      { id: 2, label: "v-gen:form.vidu_v2_time.option.5", value: "5" },
      { id: 3, label: "v-gen:form.vidu_v2_time.option.8", value: "8" },
    ],
  },
  {
    id: nanoid(),
    name: "viduV2Resolution",
    label: "v-gen:form.vidu_v2_resolution.title",
    placeholder: "v-gen:form.vidu_v2_resolution.desc",
    type: "select",
    selectOptions: [
      {
        id: 1,
        label: "v-gen:form.vidu_v2_resolution.option.360p",
        value: "360p",
      },
      {
        id: 2,
        label: "v-gen:form.vidu_v2_resolution.option.720p",
        value: "720p",
      },
      {
        id: 3,
        label: "v-gen:form.vidu_v2_resolution.option.1080p",
        value: "1080p",
      },
    ],
  },
  {
    id: nanoid(),
    name: "viduV2Scene",
    label: "v-gen:form.vidu_scene.title",
    placeholder: "v-gen:form.vidu_scene.desc",
    type: "select",
    selectOptions: VIDU_SCENE_OPTION,
  },
  {
    id: nanoid(),
    name: "viduV2MovementAmplitude",
    label: "v-gen:form.vidu_v2_movement_amplitude.title",
    placeholder: "v-gen:form.vidu_v2_movement_amplitude.desc",
    type: "select",
    selectOptions: VIDU_V2_MOVEMENT_AMPLITUDE_OPTION,
  },
  {
    id: nanoid(),
    name: "viduV2AspectRatio",
    label: "v-gen:form.vidu_v2_aspect_ratio.title",
    placeholder: "v-gen:form.vidu_v2_aspect_ratio.desc",
    type: "select",
    selectOptions: [
      {
        id: 1,
        label: "v-gen:form.vidu_v2_aspect_ratio.option.16_9",
        value: "16:9",
      },
      {
        id: 2,
        label: "v-gen:form.vidu_v2_aspect_ratio.option.9_16",
        value: "9:16",
      },
      {
        id: 3,
        label: "v-gen:form.vidu_v2_aspect_ratio.option.1_1",
        value: "1:1",
      },
    ],
  },
  {
    id: nanoid(),
    name: "viduV2Style",
    label: "v-gen:form.vidu_style.title",
    placeholder: "v-gen:form.vidu_style.desc",
    type: "select",
    selectOptions: VIDU_STYLE_OPTION,
  },

  // kling 2.0
  {
    id: nanoid(),
    name: "klingV2Type",
    label: "v-gen:form.kling_v2_type.title",
    placeholder: "v-gen:form.kling_v2_type.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.kling_v2_type.option.text_to_video",
        value: "text_to_video",
      },
      {
        id: nanoid(),
        label: "v-gen:form.kling_v2_type.option.image_to_video",
        value: "image_to_video",
      },
    ],
  },
  {
    id: nanoid(),
    name: "klingV2Image",
    label: "v-gen:form.kling_v2_image.title",
    placeholder: "v-gen:form.kling_v2_image.desc",
    type: "upload",
  },
  {
    id: nanoid(),
    name: "klingV2Prompt",
    label: "v-gen:form.kling_v2_prompt.title",
    placeholder: "v-gen:form.kling_v2_prompt.desc",
    type: "textarea",
    textareaRows: 3,
  },
  {
    id: nanoid(),
    name: "klingV2NegativePrompt",
    label: "v-gen:form.kling_v2_negative_prompt.title",
    placeholder: "v-gen:form.kling_v2_negative_prompt.desc",
    type: "textarea",
    textareaRows: 3,
  },
  {
    id: nanoid(),
    name: "klingV2Cfg",
    label: "v-gen:form.kling_v2_cfg.title",
    placeholder: "v-gen:form.kling_v2_cfg.desc",
    type: "slider",
    sliderConfig: {
      min: 0.0,
      max: 1.0,
      step: 0.1,
      showCurrentValue: true,
    },
  },
  {
    id: nanoid(),
    name: "klingV2AspectRatio",
    label: "v-gen:form.kling_v2_aspect_ratio.title",
    placeholder: "v-gen:form.kling_v2_aspect_ratio.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.kling_v2_aspect_ratio.option.1_1",
        value: "1:1",
      },
      {
        id: nanoid(),
        label: "v-gen:form.kling_v2_aspect_ratio.option.16_9",
        value: "16:9",
      },
      {
        id: nanoid(),
        label: "v-gen:form.kling_v2_aspect_ratio.option.9_16",
        value: "9:16",
      },
    ],
  },
  {
    id: nanoid(),
    name: "klingV2Duration",
    label: "v-gen:form.kling_v2_duration.title",
    placeholder: "v-gen:form.kling_v2_duration.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.kling_v2_duration.option.5",
        value: "5",
      },
      {
        id: nanoid(),
        label: "v-gen:form.kling_v2_duration.option.10",
        value: "10",
      },
    ],
  },

  // Veo 3
  {
    id: nanoid(),
    name: "veo3Prompt",
    label: "v-gen:form.veo3_prompt.title",
    placeholder: "v-gen:form.veo3_prompt.desc",
    type: "textarea",
    textareaRows: 3,
  },
  {
    id: nanoid(),
    name: "veo3AspectRatio",
    label: "v-gen:form.veo3_aspect_ratio.title",
    placeholder: "v-gen:form.veo3_aspect_ratio.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.veo3_aspect_ratio.option.1_1",
        value: "1:1",
      },
      {
        id: nanoid(),
        label: "v-gen:form.veo3_aspect_ratio.option.16_9",
        value: "16:9",
      },
      {
        id: nanoid(),
        label: "v-gen:form.veo3_aspect_ratio.option.9_16",
        value: "9:16",
      },
    ],
  },
  {
    id: nanoid(),
    name: "veo3EnhancePrompt",
    label: "v-gen:form.veo3_enhance_prompt.title",
    placeholder: "v-gen:form.veo3_enhance_prompt.desc",
    type: "switch",
  },
  {
    id: nanoid(),
    name: "veo3GenerateAudio",
    label: "v-gen:form.veo3_generate_audio.title",
    placeholder: "v-gen:form.veo3_generate_audio.desc",
    type: "switch",
  },

  // Seedance
  {
    id: nanoid(),
    name: "seedanceType",
    label: "v-gen:form.seedance_type.title",
    placeholder: "v-gen:form.seedance_type.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.seedance_type.option.text_to_video",
        value: "text_to_video",
      },
      {
        id: nanoid(),
        label: "v-gen:form.seedance_type.option.image_to_video",
        value: "image_to_video",
      },
    ],
  },
  {
    id: nanoid(),
    name: "seedanceModel",
    label: "v-gen:form.seedance_model.title",
    placeholder: "v-gen:form.seedance_model.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.seedance_model.option.pro",
        value: "pro",
      },
      {
        id: nanoid(),
        label: "v-gen:form.seedance_model.option.lite",
        value: "lite",
      },
    ],
  },
  {
    id: nanoid(),
    name: "seedanceText",
    label: "v-gen:form.seedance_text.title",
    placeholder: "v-gen:form.seedance_text.desc",
    type: "textarea",
    textareaRows: 3,
  },
  {
    id: nanoid(),
    name: "seedanceReslution",
    label: "v-gen:form.seedance_resolution.title",
    placeholder: "v-gen:form.seedance_resolution.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.seedance_resolution.option.720p",
        value: "720p",
      },
      {
        id: nanoid(),
        label: "v-gen:form.seedance_resolution.option.1080p",
        value: "1080p",
      },
      {
        id: nanoid(),
        label: "v-gen:form.seedance_resolution.option.480p",
        value: "480p",
      },
    ],
  },
  {
    id: nanoid(),
    name: "seedanceRatio",
    label: "v-gen:form.seedance_ratio.title",
    placeholder: "v-gen:form.seedance_ratio.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.seedance_ratio.option.1_1",
        value: "1:1",
      },
      {
        id: nanoid(),
        label: "v-gen:form.seedance_ratio.option.3_4",
        value: "3:4",
      },
      {
        id: nanoid(),
        label: "v-gen:form.seedance_ratio.option.9_16",
        value: "9:16",
      },
      {
        id: nanoid(),
        label: "v-gen:form.seedance_ratio.option.21_9",
        value: "21:9",
      },
      {
        id: nanoid(),
        label: "v-gen:form.seedance_ratio.option.9_21",
        value: "9:21",
      },
    ],
  },
  {
    id: nanoid(),
    name: "seedanceDuration",
    label: "v-gen:form.seedance_duration.title",
    placeholder: "v-gen:form.seedance_duration.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.seedance_duration.option.5",
        value: "5",
      },
      {
        id: nanoid(),
        label: "v-gen:form.seedance_duration.option.10",
        value: "10",
      },
    ],
  },
  {
    id: nanoid(),
    name: "seedanceWm",
    label: "v-gen:form.seedance_wm.title",
    placeholder: "v-gen:form.seedance_wm.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.seedance_wm.option.true",
        value: "true",
      },
      {
        id: nanoid(),
        label: "v-gen:form.seedance_wm.option.false",
        value: "false",
      },
    ],
  },
  {
    id: nanoid(),
    name: "seedanceCf",
    label: "v-gen:form.seedance_cf.title",
    placeholder: "v-gen:form.seedance_cf.desc",
    type: "select",
    selectOptions: [
      {
        id: nanoid(),
        label: "v-gen:form.seedance_cf.option.true",
        value: "true",
      },
      {
        id: nanoid(),
        label: "v-gen:form.seedance_cf.option.false",
        value: "false",
      },
    ],
  },
  {
    id: nanoid(),
    name: "seedanceImage",
    label: "v-gen:form.seedance_image.title",
    placeholder: "v-gen:form.seedance_image.desc",
    type: "upload",
  },
];
