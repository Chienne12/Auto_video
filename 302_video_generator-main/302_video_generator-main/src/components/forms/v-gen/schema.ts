import { z } from "zod";

import { HiggsfieldFormKey, HiggsfieldSchema } from "./higgsfield/schema";
import { KlingV21FormKey, KlingV21Schema } from "./kling-v2.1/schema";
import { KlingV2FormKey, KlingV2Schema } from "./kling-v2/schema";
import {
  MinimaxHailuo02FormKey,
  MinimaxHailuo02Schema,
} from "./minimax-hailuo-02/schema";
import { MJVideoFormKey, MJVideoSchema } from "./mj-video/schema";
import { PikaFormKey, PikaSchema } from "./pika/schema";
import { SeedanceFormKey, SeedanceSchema } from "./seedance/schema";
import { Veo3FastFormKey, Veo3FastSchema } from "./veo3-fast/schema";
import {
  Veo3ProFramesFormKey,
  Veo3ProFramesSchema,
} from "./veo3-pro-frames/schema";
import { Veo3ProFormKey, Veo3ProSchema } from "./veo3-pro/schema";
import { Veo3FormKey, Veo3Schema } from "./veo3/schema";
import { ViduV2FormKey, ViduV2Schema } from "./vidu-v2/schema";

// const FileSchema = typeof File === "undefined" ? z.any() : z.instanceof(File);

// 基础 Schema
const BaseVideoSchema = z.object({
  model: z.string().optional(),
  prompt: z.string().optional(),
  firstFile: z.string().or(z.null()).optional(),
  lastFile: z.string().or(z.null()).optional(),
  firstFrame: z.string().or(z.null()).optional(),
  lastFrame: z.string().or(z.null()).optional(),
  thirdFile: z.string().or(z.null()).optional(),
  thirdFrame: z.string().or(z.null()).optional(),
  referenceImage1: z.string().or(z.null()).optional(),
  referenceImage2: z.string().or(z.null()).optional(),
  referenceImage3: z.string().or(z.null()).optional(),
  referenceImage4: z.string().or(z.null()).optional(),
  ratio: z.string().optional(),
  type: z.string().optional(),
  time: z.string().optional(),
  loop: z.string().optional(),
  audio: z.string().optional(),
  camera: z.string().optional(),
  style: z.string().optional(),
  template: z.string().optional(),
});

// 分组合并 Schema 以减少复杂性
const VeoSchemasGroup = Veo3Schema.merge(Veo3ProSchema)
  .merge(Veo3ProFramesSchema)
  .merge(Veo3FastSchema);

const KlingSchemasGroup = KlingV21Schema.merge(KlingV2Schema);

const OtherSchemasGroup = HiggsfieldSchema.merge(ViduV2Schema)
  .merge(KlingSchemasGroup)
  .merge(SeedanceSchema)
  .merge(MinimaxHailuo02Schema)
  .merge(MJVideoSchema)
  .merge(PikaSchema);

// 最终 Schema
export const VideoSchema =
  BaseVideoSchema.merge(VeoSchemasGroup).merge(OtherSchemasGroup);

// 简化类型定义
export type VideoFormKey =
  | "model"
  | "prompt"
  | "firstFile"
  | "lastFile"
  | "firstFrame"
  | "lastFrame"
  | "thirdFile"
  | "thirdFrame"
  | "referenceImage1"
  | "referenceImage2"
  | "referenceImage3"
  | "referenceImage4"
  | "ratio"
  | "type"
  | "time"
  | "loop"
  | "audio"
  | "camera"
  | "style"
  | "template"
  // higgsfield
  | HiggsfieldFormKey
  // vidu v2
  | ViduV2FormKey
  // kling v2
  | KlingV2FormKey
  // kling v2.1
  | KlingV21FormKey
  // veo 3
  | Veo3FormKey
  // veo 3 fast
  | Veo3FastFormKey
  // veo 3 pro
  | Veo3ProFormKey
  // veo 3 pro frames
  | Veo3ProFramesFormKey
  // Seedance
  | SeedanceFormKey
  // MiniMax-Hailuo-02
  | MinimaxHailuo02FormKey
  // Mj-Video
  | MJVideoFormKey
  // Pika
  | PikaFormKey;
