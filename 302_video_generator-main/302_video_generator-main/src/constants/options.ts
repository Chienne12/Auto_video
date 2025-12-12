import { nanoid } from "nanoid";

export type OptionProps = {
  id: number | string;
  label: string;
  value: string;
  payload?: {
    image?: string;
    video?: string;
  };
};

export const APP_THEME_OPTION: OptionProps[] = [
  { id: 1, label: "global:theme.light", value: "light" },
  { id: 2, label: "global:theme.dark", value: "dark" },
  { id: 3, label: "global:theme.system", value: "system" },
];

export const DEFAULT_RATIO_OPTION: OptionProps[] = [
  { id: 1, label: "1:1", value: "1:1" },
];

export const KLING_RATIO_OPTION: OptionProps[] = [
  { id: 1, label: "1:1", value: "1:1" },
  { id: 2, label: "16:9", value: "16:9" },
  { id: 3, label: "9:16", value: "9:16" },
];

export const MINIMAX_RATIO_OPTION: OptionProps[] = [
  { id: 1, label: "1:1", value: "1:1" },
  { id: 2, label: "16:9", value: "16:9" },
  { id: 3, label: "9:16", value: "9:16" },
];

export const PIKA_RATIO_OPTION: OptionProps[] = [
  { id: 1, label: "1:1", value: "1:1" },
  { id: 2, label: "16:9", value: "16:9" },
  { id: 3, label: "9:16", value: "9:16" },
];

export const RUNWAY_RATIO_OPTION: OptionProps[] = [
  { id: 1, label: "1280:768", value: "1280:768" },
  { id: 2, label: "768:1280", value: "768:1280" },
];

export const COG_RATIO_OPTION: OptionProps[] = [
  { id: 1, label: "1:1", value: "1024:1024" },
  { id: 2, label: "3:2", value: "720:480" },
  { id: 3, label: "4:3", value: "1280:960" },
  { id: 4, label: "3:4", value: "960:1280" },
  { id: 5, label: "16:9", value: "1920:1080" },
  { id: 6, label: "9:16", value: "1080:1920" },
];

export const LIGHTRICKS_RATIO_OPTION: OptionProps[] = [
  { id: 1, label: "3:2", value: "3:2" },
];

export const VIDU_RATIO_OPTION: OptionProps[] = [
  // { id: 1, label: "1:1", value: "1:1" },
  { id: 2, label: "16:9", value: "16:9" },
  { id: 3, label: "9:16", value: "9:16" },
];

export const WANX_RATION_OPTION: OptionProps[] = [
  { id: 1, label: "1:1", value: "960*960" },
  { id: 2, label: "4:3", value: "1088*832" },
  { id: 3, label: "3:4", value: "832*1088" },
  { id: 4, label: "16:9", value: "1280*720" },
  { id: 5, label: "9:16", value: "720*1280" },
];

export const SEAWEED_RATIO_OPTION: OptionProps[] = [
  { id: 1, label: "1:1", value: "1:1" },
  { id: 2, label: "4:3", value: "4:3" },
  { id: 3, label: "16:9", value: "16:9" },
];

// export const HAIPER_RATIO_OPTION: OptionProps[] = [
//   {
//     id: 1,
//     label: "自定义",
//     value: "0",
//   },
// ];

// export const LUMA_RATIO_OPTION: OptionProps[] = [
//   {
//     id: 1,
//     label: "自定义",
//     value: "0",
//   },
// ];

// export const PIXVERSE_RATIO_OPTION: OptionProps[] = [
//   {
//     id: 1,
//     label: "自定义",
//     value: "0",
//   },
// ];

export const CUSTOMER_RATIO_OPTION: OptionProps[] = [
  {
    id: 1,
    label: "自定义",
    value: "0",
  },
];

export const VIDEO_MODEL_OPTION: OptionProps[] = [
  {
    id: nanoid(),
    label: "v-gen:form.model.option.seedance",
    value: "seedance",
  },
  { id: nanoid(), label: "v-gen:form.model.option.seaweed", value: "seaweed" },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.veo3",
    value: "veo3",
  },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.veo3_pro",
    value: "veo3_pro",
  },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.veo3_pro_frames",
    value: "veo3_pro_frames",
  },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.veo3_fast",
    value: "veo3_fast",
  },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.mj_video",
    value: "mj_video",
  },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.higgsfield",
    value: "higgsfield",
  },
  { id: nanoid(), label: "v-gen:form.model.option.luma", value: "luma" },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.kling_21",
    value: "kling_21",
  },
  { id: nanoid(), label: "v-gen:form.model.option.kling_2", value: "kling_2" },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.kling_15",
    value: "kling_15",
  },
  { id: nanoid(), label: "v-gen:form.model.option.kling_16", value: "kling" },
  { id: nanoid(), label: "v-gen:form.model.option.runway", value: "runway" },
  { id: nanoid(), label: "v-gen:form.model.option.cog", value: "cog" },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.minimaxi_hailuo_02",
    value: "minimaxi_hailuo_02",
  },
  { id: nanoid(), label: "v-gen:form.model.option.minimax", value: "minimax" },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.minimax_live2d",
    value: "minimax_live2d",
  },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.minimax_s2v01",
    value: "minimax_s2v01",
  },
  { id: nanoid(), label: "v-gen:form.model.option.pika", value: "pika" },
  { id: nanoid(), label: "v-gen:form.model.option.genmo", value: "genmo" },
  { id: nanoid(), label: "v-gen:form.model.option.haiper", value: "haiper" },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.pixverse",
    value: "pixverse",
  },
  { id: nanoid(), label: "v-gen:form.model.option.vidu_2", value: "vidu_2" },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.lightricks",
    value: "lightricks",
  },
  { id: nanoid(), label: "v-gen:form.model.option.hunyuan", value: "hunyuan" },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.wanx_turbo",
    value: "wanx_turbo",
  },
  {
    id: nanoid(),
    label: "v-gen:form.model.option.wanx_plus",
    value: "wanx_plus",
  },
];

export const VIDEO_TYPE_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.type.option.fast", value: "fast" },
  { id: 2, label: "v-gen:form.type.option.hq", value: "hq" },
];

export const VIDEO_TIME_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.time.option.short", value: "5s" },
  { id: 2, label: "v-gen:form.time.option.long", value: "10s" },
];

export const VIDEO_LOOP_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.loop.option.open", value: "true" },
  { id: 2, label: "v-gen:form.loop.option.close", value: "false" },
];

export const VIDEO_AUDIO_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.audio.option.open", value: "true" },
  { id: 2, label: "v-gen:form.audio.option.close", value: "false" },
];

export const VIDEO_CAMERA_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.camera.option.none", value: "none" },
  {
    id: 2,
    label: "v-gen:form.camera.option.move_left",
    value: "camera move left ",
  },
  {
    id: 3,
    label: "v-gen:form.camera.option.move_right",
    value: "camera move right ",
  },
  {
    id: 4,
    label: "v-gen:form.camera.option.move_up",
    value: "camera move up ",
  },
  {
    id: 5,
    label: "v-gen:form.camera.option.move_down",
    value: "camera move down ",
  },
  {
    id: 6,
    label: "v-gen:form.camera.option.push_in",
    value: "camera Push In ",
  },
  {
    id: 7,
    label: "v-gen:form.camera.option.push_out",
    value: "camera move out ",
  },
  {
    id: 8,
    label: "v-gen:form.camera.option.pan_left",
    value: "camera pan left ",
  },
  {
    id: 9,
    label: "v-gen:form.camera.option.pan_right",
    value: "camera pan right ",
  },
  {
    id: 10,
    label: "v-gen:form.camera.option.orbit_left",
    value: "camera orbit left ",
  },
  {
    id: 11,
    label: "v-gen:form.camera.option.orbit_right",
    value: "camera orbit right ",
  },
  {
    id: 12,
    label: "v-gen:form.camera.option.grane_up",
    value: "camera grane up ",
  },
  {
    id: 13,
    label: "v-gen:form.camera.option.grane_down",
    value: "camera grane down ",
  },
];

export const VIDEO_STYLE_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.style.option.none", value: "none" },
  { id: 2, label: "v-gen:form.style.option.inflate", value: "Inflate" },
  { id: 3, label: "v-gen:form.style.option.melt", value: "Melt" },
  { id: 4, label: "v-gen:form.style.option.explode", value: "Explode" },
  { id: 5, label: "v-gen:form.style.option.squish", value: "Squish" },
  { id: 6, label: "v-gen:form.style.option.crush", value: "Crush" },
  { id: 7, label: "v-gen:form.style.option.cake_ify", value: "Cake-ify" },
  { id: 8, label: "v-gen:form.style.option.ta_da", value: "Ta-da" },
  { id: 9, label: "v-gen:form.style.option.deflate", value: "Deflate" },
  { id: 10, label: "v-gen:form.style.option.crumble", value: "Crumble" },
  { id: 11, label: "v-gen:form.style.option.dissolve", value: "Dissolve" },
];

export const VIDEO_TEMPLATE_OPTION: OptionProps[] = [
  {
    id: 1,
    label: "v-gen:form.template.option.hairCurl",
    value: "310371322329472",
  },
  {
    id: 2,
    label: "v-gen:form.template.option.hairKing",
    value: "308552687706496",
  },
  {
    id: 3,
    label: "v-gen:form.template.option.hugYourLove",
    value: "303624424723200",
  },
  {
    id: 4,
    label: "v-gen:form.template.option.wonderWomanTransformation",
    value: "309283958194560",
  },
  {
    id: 5,
    label: "v-gen:form.template.option.catwomanTransformation",
    value: "307489548427968",
  },
  {
    id: 6,
    label: "v-gen:form.template.option.harleyQuinnTransformation",
    value: "307489434436288",
  },
  {
    id: 7,
    label: "v-gen:form.template.option.muscleMan",
    value: "308621408717184",
  },
  {
    id: 8,
    label: "v-gen:form.template.option.summonHulk",
    value: "304826314164992",
  },
  {
    id: 9,
    label: "v-gen:form.template.option.jokerRebirth",
    value: "304826126435072",
  },
  {
    id: 10,
    label: "v-gen:form.template.option.ironmanTransformation",
    value: "304826054394624",
  },
  {
    id: 11,
    label: "v-gen:form.template.option.batmanReturns",
    value: "304826374632192",
  },
  {
    id: 12,
    label: "v-gen:form.template.option.wickedShots",
    value: "303788802773760",
  },
  {
    id: 13,
    label: "v-gen:form.template.option.venomTransformation",
    value: "303624537709312",
  },
  {
    id: 14,
    label: "v-gen:form.template.option.venomColorBox",
    value: "304358279051648",
  },
  {
    id: 15,
    label: "v-gen:form.template.option.zombieMode",
    value: "302325299651648",
  },
  {
    id: 16,
    label: "v-gen:form.template.option.squishIt",
    value: "302325299692608",
  },
  {
    id: 17,
    label: "v-gen:form.template.option.zombieHand",
    value: "302325299672128",
  },
  {
    id: 18,
    label: "v-gen:form.template.option.wizardHat",
    value: "302325299661888",
  },
  {
    id: 19,
    label: "v-gen:form.template.option.leggyRun",
    value: "302325299711040",
  },
  {
    id: 20,
    label: "v-gen:form.template.option.monsterInvades",
    value: "302325299682368",
  },
  {
    id: 21,
    label: "v-gen:form.template.option.legoBlast",
    value: "302325299702848",
  },
  {
    id: 22,
    label: "v-gen:form.template.option.sailorMoonTransformation",
    value: "313359138372032",
  },
  {
    id: 23,
    label: "v-gen:form.template.option.blackGokuEngine",
    value: "313359209531840",
  },
  {
    id: 24,
    label: "v-gen:form.template.option.aliveArt",
    value: "302325299721280",
  },
  {
    id: 25,
    label: "v-gen:form.template.option.babyFace",
    value: "315446232403008",
  },
  {
    id: 26,
    label: "v-gen:form.template.option.cigarBoss",
    value: "316645675647872",
  },
  {
    id: 27,
    label: "v-gen:form.template.option.fightAndMeet",
    value: "315447659476032",
  },
  {
    id: 28,
    label: "v-gen:form.template.option.kissOfLove",
    value: "315446315336768",
  },
  {
    id: 29,
    label: "v-gen:form.template.option.christmasOutfit",
    value: "312314911869312",
  },
  {
    id: 30,
    label: "v-gen:form.template.option.christmasGiftBox",
    value: "311521768592256",
  },
  {
    id: 31,
    label: "v-gen:form.template.option.santaHideAndSeek",
    value: "311521879229312",
  },
  {
    id: 32,
    label: "v-gen:form.template.option.venomReveal",
    value: "305714097668480",
  },
  {
    id: 33,
    label: "v-gen:form.template.option.venomBrother",
    value: "306059795500352",
  },
  {
    id: 34,
    label: "v-gen:form.template.option.squidGame",
    value: "316139945292864",
  },
  {
    id: 35,
    label: "v-gen:form.template.option.ingiGaze",
    value: "317013620689664",
  },
];

// VIDU
export const VIDU_TYPE_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.vidu_type.option.general", value: "general" },
  { id: 2, label: "v-gen:form.vidu_type.option.character", value: "character" },
  { id: 3, label: "v-gen:form.vidu_type.option.scene", value: "scene" },
];

export const VIDU_STYLE_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.vidu_style.option.general", value: "general" },
  { id: 2, label: "v-gen:form.vidu_style.option.anime", value: "anime" },
];

export const VIDU_TIME_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.vidu_time.option.short", value: "4" },
  { id: 2, label: "v-gen:form.vidu_time.option.long", value: "8" },
];

export const VIDU_RESOLUTION_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.vidu_resolution.option.sd", value: "512" },
  { id: 2, label: "v-gen:form.vidu_resolution.option.hd", value: "720p" },
  { id: 3, label: "v-gen:form.vidu_resolution.option.fhd", value: "1080p" },
];

export const VIDU_SCENE_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.vidu_scene.option.hug", value: "hug" }, // 拥抱相关
  { id: 2, label: "v-gen:form.vidu_scene.option.kiss", value: "kiss" }, // 亲吻
  {
    id: 3,
    label: "v-gen:form.vidu_scene.option.christmas_effect",
    value: "christmas@effect",
  }, // 圣诞老人变身
  {
    id: 4,
    label: "v-gen:form.vidu_scene.option.santa_gifts",
    value: "christmas@gifts",
  }, // 圣诞老人来送礼
  {
    id: 5,
    label: "v-gen:form.vidu_scene.option.merry_christmas",
    value: "christmas@merry",
  }, // 圣诞节举杯祝贺
  {
    id: 6,
    label: "v-gen:form.vidu_scene.option.santa_hug",
    value: "christmas@hug",
  }, // 圣诞老人来拥抱
  {
    id: 8,
    label: "v-gen:form.vidu_scene.option.inflate",
    value: "morphlab@inflate",
  }, // 膨胀
  {
    id: 9,
    label: "v-gen:form.vidu_scene.option.twist",
    value: "morphlab@twist",
  }, // 扭曲
  {
    id: 10,
    label: "v-gen:form.vidu_scene.option.explode",
    value: "morphlab@explode",
  }, // 爆炸
  {
    id: 10,
    label: "v-gen:form.vidu_scene.option.melt",
    value: "morphlab@melt",
  }, // 融化
  // 实况照片
  {
    id: 11,
    label: "v-gen:form.vidu_scene.option.live_photo@smile",
    value: "live_photo@smile",
  }, // 微笑
  {
    id: 12,
    label: "v-gen:form.vidu_scene.option.live_photo@wind",
    value: "live_photo@wind",
  }, // 风动
  {
    id: 13,
    label: "v-gen:form.vidu_scene.option.live_photo@camera",
    value: "live_photo@camera",
  }, // 镜头动
  {
    id: 14,
    label: "v-gen:form.vidu_scene.option.live_photo@walk",
    value: "live_photo@walk",
  }, // 走路
  // 情绪特效
  {
    id: 15,
    label: "v-gen:form.vidu_scene.option.emotionlab@terrible",
    value: "emotionlab@terrible",
  }, // 恐惧
  {
    id: 16,
    label: "v-gen:form.vidu_scene.option.emotionlab@smile",
    value: "emotionlab@smile",
  }, // 微笑
  {
    id: 17,
    label: "v-gen:form.vidu_scene.option.emotionlab@laugh",
    value: "emotionlab@laugh",
  }, // 狂笑
  {
    id: 18,
    label: "v-gen:form.vidu_scene.option.emotionlab@surprised",
    value: "emotionlab@surprised",
  }, // 惊讶
  // 老照片
  {
    id: 19,
    label: "v-gen:form.vidu_scene.option.live_memory@old_photo",
    value: "live_memory@old_photo",
  }, // 老照片动起来
  // 发型特效
  {
    id: 20,
    label: "v-gen:form.vidu_scene.option.hair_swap@curl",
    value: "hair_swap@curl",
  }, // 羊毛卷
  {
    id: 21,
    label: "v-gen:form.vidu_scene.option.hair_swap@double",
    value: "hair_swap@double",
  }, // 双马尾
  {
    id: 22,
    label: "v-gen:form.vidu_scene.option.hair_swap@long",
    value: "hair_swap@long",
  }, // 长发
  // 互动特效
  {
    id: 23,
    label: "v-gen:form.vidu_scene.option.interaction@love",
    value: "interaction@love",
  }, // 爱的互动
  {
    id: 24,
    label: "v-gen:form.vidu_scene.option.interaction@rose",
    value: "interaction@rose",
  }, // 送玫瑰花
  // 新年特效
  {
    id: 25,
    label: "v-gen:form.vidu_scene.option.lunar_newyear@fireworks",
    value: "lunar_newyear@fireworks",
  }, // 新年烟花
  {
    id: 26,
    label: "v-gen:form.vidu_scene.option.lunar_newyear@cheers",
    value: "lunar_newyear@cheers",
  }, // 新年举杯
  {
    id: 27,
    label: "v-gen:form.vidu_scene.option.lunar_newyear@gift",
    value: "lunar_newyear@gift",
  }, // 新年红包
  // 童年回忆
  {
    id: 28,
    label: "v-gen:form.vidu_scene.option.youth_rewind@rewind",
    value: "youth_rewind@rewind",
  }, // 童年回忆
  // 古风换装
  {
    id: 29,
    label: "v-gen:form.vidu_scene.option.dynasty_dress@dress",
    value: "dynasty_dress@dress",
  }, // 古风换装
  // 全家福比心
  {
    id: 30,
    label: "v-gen:form.vidu_scene.option.lover_pose@pose",
    value: "lover_pose@pose",
  }, // 全家福比心
  // 财神特效
  {
    id: 31,
    label: "v-gen:form.vidu_scene.option.wish_sender@love",
    value: "wish_sender@love",
  }, // 和财神比心
  {
    id: 32,
    label: "v-gen:form.vidu_scene.option.wish_sender@coins",
    value: "wish_sender@coins",
  }, // 财神发金币
  // 婚礼特效
  {
    id: 33,
    label: "v-gen:form.vidu_scene.option.dreamy_wedding",
    value: "dreamy_wedding",
  }, // 梦幻婚礼
  {
    id: 34,
    label: "v-gen:form.vidu_scene.option.romantic_lift",
    value: "romantic_lift",
  }, // 浪漫公主抱
  {
    id: 35,
    label: "v-gen:form.vidu_scene.option.sweet_proposal",
    value: "sweet_proposal",
  }, // 甜蜜求婚
  // 情侣互动
  {
    id: 36,
    label: "v-gen:form.vidu_scene.option.couple_arrival@flower",
    value: "couple_arrival@flower",
  }, // 情侣送花
  {
    id: 37,
    label: "v-gen:form.vidu_scene.option.couple_arrival@hug",
    value: "couple_arrival@hug",
  }, // 情侣拥抱
  {
    id: 38,
    label: "v-gen:form.vidu_scene.option.couple_arrival@kiss",
    value: "couple_arrival@kiss",
  }, // 情侣亲吻
  {
    id: 39,
    label: "v-gen:form.vidu_scene.option.couple_arrival@wave",
    value: "couple_arrival@wave",
  }, // 情侣挥手
  // 丘比特之箭
  {
    id: 40,
    label: "v-gen:form.vidu_scene.option.cupid_arrow",
    value: "cupid_arrow",
  }, // 丘比特之箭
  // 萌宠恋人
  {
    id: 41,
    label: "v-gen:form.vidu_scene.option.pet_lovers",
    value: "pet_lovers",
  }, // 萌宠恋人
];

/****************************************************** Higgsfield ******************************************************/
export const VIDEO_HIGGSFIELD_TIME_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.higgsfield_time.option.short", value: "3s" },
  { id: 2, label: "v-gen:form.higgsfield_time.option.long", value: "5s" },
];

export const VIDEO_HIGGSFIELD_MODEL_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.higgsfield_model.option.lite", value: "lite" },
  {
    id: 2,
    label: "v-gen:form.higgsfield_model.option.standard",
    value: "standard",
  },
  { id: 3, label: "v-gen:form.higgsfield_model.option.turbo", value: "turbo" },
];

export const VIDEO_HIGGSFIELD_MOTION_OPTION: OptionProps[] = [
  {
    id: "4e981984-1cdc-4b96-a2b1-1a7c1ecb822d",
    label: "v-gen:form.higgsfield_motion.option.disintegration1",
    value: "4e981984-1cdc-4b96-a2b1-1a7c1ecb822d",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/634ede39-bc1f-4635-b4bc-eee2d87a4735.webp",
    },
  },
  {
    id: "eacdca06-1fe2-4402-b8d6-4dc32f2889c5",
    label: "v-gen:form.higgsfield_motion.option.disintegration2",
    value: "eacdca06-1fe2-4402-b8d6-4dc32f2889c5",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/cd355c59-8f7c-494d-8409-617726f7582a.webp",
    },
  },
  {
    id: "e0394620-9694-441b-b3f8-a4230abcd9ac",
    label: "v-gen:form.higgsfield_motion.option.car_explosion1",
    value: "e0394620-9694-441b-b3f8-a4230abcd9ac",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/289af8ae-661a-422b-85ed-c498cd3aa7cc.webp",
    },
  },
  {
    id: "41574f0a-2e5d-4b8c-8b9d-b3fef81151a5",
    label: "v-gen:form.higgsfield_motion.option.car_explosion2",
    value: "41574f0a-2e5d-4b8c-8b9d-b3fef81151a5",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/5c68e49b-8ae4-4cfb-986f-efe1edccb956.webp",
    },
  },
  {
    id: "97687e52-2cfc-4073-ae62-a00c057c2aa2",
    label: "v-gen:form.higgsfield_motion.option.lens_flare1",
    value: "97687e52-2cfc-4073-ae62-a00c057c2aa2",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/b8de1ca8-5fbc-4a99-b1df-d8d9cc4aeb54.webp",
    },
  },
  {
    id: "53384cbd-e077-4668-b3fe-1ff771564f56",
    label: "v-gen:form.higgsfield_motion.option.lens_flare2",
    value: "53384cbd-e077-4668-b3fe-1ff771564f56",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/072ff546-5771-497e-afbd-372b409329c5.webp",
    },
  },
  {
    id: "86b3d8dd-78e2-4c84-9ca3-5a5b3c5a6382",
    label: "v-gen:form.higgsfield_motion.option.dirty_lens1",
    value: "86b3d8dd-78e2-4c84-9ca3-5a5b3c5a6382",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/9a51bdce-eec3-4f7f-b3b3-8666ceabc1fc.webp",
    },
  },
  {
    id: "635e322f-f711-4a4b-98b8-c1b62d7befe9",
    label: "v-gen:form.higgsfield_motion.option.dirty_lens2",
    value: "635e322f-f711-4a4b-98b8-c1b62d7befe9",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/c6bd7a67-f060-4be7-a951-3535641ebe6d.webp",
    },
  },
  {
    id: "b8c1c065-2d00-4583-ac52-4e89ec2d2641",
    label: "v-gen:form.higgsfield_motion.option.soul_jump1",
    value: "b8c1c065-2d00-4583-ac52-4e89ec2d2641",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/5603662c-9c62-4a48-981d-bbd4f7b948fc.webp",
    },
  },
  {
    id: "2650aad0-190e-4574-bde6-8378071a4d7c",
    label: "v-gen:form.higgsfield_motion.option.soul_jump2",
    value: "2650aad0-190e-4574-bde6-8378071a4d7c",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/2c7e7492-4198-4bd9-b6d6-f800efcd5dd0.webp",
    },
  },
  {
    id: "fdc223d4-9402-47c6-9e07-5801985b450e",
    label: "v-gen:form.higgsfield_motion.option.set_on_fire1",
    value: "fdc223d4-9402-47c6-9e07-5801985b450e",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/61d282a0-e485-4408-8f24-eee02eef2dea.webp",
    },
  },
  {
    id: "06b50d3a-65a9-432b-bf0b-493fc3dcc006",
    label: "v-gen:form.higgsfield_motion.option.set_on_fire2",
    value: "06b50d3a-65a9-432b-bf0b-493fc3dcc006",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/a0c9ff96-e3a7-4454-9099-a1f734f50c9e.webp",
    },
  },
  {
    id: "3b83bad3-64bd-4baa-bf73-be886f19a10c",
    label: "v-gen:form.higgsfield_motion.option.flying1",
    value: "3b83bad3-64bd-4baa-bf73-be886f19a10c",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/8e79919f-3e66-4326-8695-5b96590123ee.webp",
    },
  },
  {
    id: "d5ec4a6e-d982-4245-92eb-971c74505c9a",
    label: "v-gen:form.higgsfield_motion.option.flying2",
    value: "d5ec4a6e-d982-4245-92eb-971c74505c9a",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/ada09219-82bf-431c-99b5-ee2d3ffcc5a9.webp",
    },
  },
  {
    id: "0ab33462-481e-4c78-8ffc-086bebd84187",
    label: "v-gen:form.higgsfield_motion.option.eyes_in1",
    value: "0ab33462-481e-4c78-8ffc-086bebd84187",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/688511d1-fcc8-4f75-872c-5696ca2b3b5a.webp",
    },
  },
  {
    id: "f226ac67-43d3-4726-ad9c-132608bda8b3",
    label: "v-gen:form.higgsfield_motion.option.eyes_in2",
    value: "f226ac67-43d3-4726-ad9c-132608bda8b3",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/a8caa3db-bcf2-4e30-b5fe-37fafdd59140.webp",
    },
  },
  {
    id: "aa555597-3d9b-4385-b9af-106fe7e995e2",
    label: "v-gen:form.higgsfield_motion.option.push_to_glass1",
    value: "aa555597-3d9b-4385-b9af-106fe7e995e2",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/c47e12c2-3afc-496d-84f5-0834d3f2bc92.webp",
    },
  },
  {
    id: "d79c48c4-38ba-45d2-ae1c-70cd5924ccc3",
    label: "v-gen:form.higgsfield_motion.option.push_to_glass2",
    value: "d79c48c4-38ba-45d2-ae1c-70cd5924ccc3",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/e803055c-62bb-4b5d-a785-fc98d405e8a7.webp",
    },
  },
  {
    id: "cd5bfd11-5a1a-46e0-9294-b22b0b733b1e",
    label: "v-gen:form.higgsfield_motion.option.face_punch1",
    value: "cd5bfd11-5a1a-46e0-9294-b22b0b733b1e",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/4c75250f-a508-4d36-b092-25cc0837f127.webp",
    },
  },
  {
    id: "91da0dd0-c8e1-4793-b77e-946e98bc7ebb",
    label: "v-gen:form.higgsfield_motion.option.face_punch2",
    value: "91da0dd0-c8e1-4793-b77e-946e98bc7ebb",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/198644c9-d8d8-474b-a5f3-7b33dbaf6939.webp",
    },
  },
  {
    id: "ad85a3a8-919d-45a3-8fa6-0727fc7b7fe7",
    label: "v-gen:form.higgsfield_motion.option.kiss1",
    value: "ad85a3a8-919d-45a3-8fa6-0727fc7b7fe7",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/5bb5661c-2876-4a67-bc71-76fbecd8ccb0.webp",
    },
  },
  {
    id: "38c80734-90b7-4fcb-8fc2-16a055d2b3ba",
    label: "v-gen:form.higgsfield_motion.option.kiss2",
    value: "38c80734-90b7-4fcb-8fc2-16a055d2b3ba",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/ca3ccb38-9ce3-4249-ba80-0231c70732ae.webp",
    },
  },
  {
    id: "46e23a6b-1047-40f1-9cf5-33f5f55ddf2e",
    label: "v-gen:form.higgsfield_motion.option.turning_metal1",
    value: "46e23a6b-1047-40f1-9cf5-33f5f55ddf2e",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/d44a136d-8b78-49c8-bf3d-889e5f30c547.webp",
    },
  },
  {
    id: "ad8bffe9-17a9-493d-944d-7fe47275c663",
    label: "v-gen:form.higgsfield_motion.option.turning_metal2",
    value: "ad8bffe9-17a9-493d-944d-7fe47275c663",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/0f3b16dd-9295-49e4-9e91-17d158bf52d1.webp",
    },
  },
  {
    id: "b6eb17bb-d336-46db-99c6-34f01ae754f3",
    label: "v-gen:form.higgsfield_motion.option.agent_reveal1",
    value: "b6eb17bb-d336-46db-99c6-34f01ae754f3",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/4602e616-84b7-4348-a48d-aa255c974329.webp",
    },
  },
  {
    id: "a5e7e831-c323-4f69-926f-74f31197809b",
    label: "v-gen:form.higgsfield_motion.option.agent_reveal2",
    value: "a5e7e831-c323-4f69-926f-74f31197809b",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/d17809b1-c9a2-49e7-b979-e1015f9b9f83.webp",
    },
  },
  {
    id: "ae4a319d-a06f-4b30-8b67-55a35a22f24a",
    label: "v-gen:form.higgsfield_motion.option.glam1",
    value: "ae4a319d-a06f-4b30-8b67-55a35a22f24a",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/a1f2a76f-c661-4ddb-8d8b-3b5f06db09c3.webp",
    },
  },
  {
    id: "5763f4ec-ea6b-449d-9509-4596962668a8",
    label: "v-gen:form.higgsfield_motion.option.glam2",
    value: "5763f4ec-ea6b-449d-9509-4596962668a8",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/73febe1b-6c58-4ed9-aeaf-9337a2fa58c0.webp",
    },
  },
  {
    id: "a7984a1f-f2ed-41a8-8a4c-4a66606ac6bb",
    label: "v-gen:form.higgsfield_motion.option.lens_crack",
    value: "a7984a1f-f2ed-41a8-8a4c-4a66606ac6bb",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/1b196aab-9ebc-4ea4-8d36-685d05eaa1c3.webp",
    },
  },
  {
    id: "52d0b18d-c098-4526-b576-b2838d34855e",
    label: "v-gen:form.higgsfield_motion.option.wind_to_face1",
    value: "52d0b18d-c098-4526-b576-b2838d34855e",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/aa866b5d-a8a5-4d42-bbcf-b682602205b0.webp",
    },
  },
  {
    id: "080d9f40-110d-4e74-bc93-bc4e9a9032d5",
    label: "v-gen:form.higgsfield_motion.option.wind_to_face2",
    value: "080d9f40-110d-4e74-bc93-bc4e9a9032d5",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/1c7da47c-4eed-491e-80fb-be89826ce230.webp",
    },
  },
  {
    id: "52aa7be6-854f-45cb-930c-b98d64eb593c",
    label: "v-gen:form.higgsfield_motion.option.levitation1",
    value: "52aa7be6-854f-45cb-930c-b98d64eb593c",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/1825dcff-da3d-442b-b1dc-4f1bfe9006b5.webp",
    },
  },
  {
    id: "b03ec615-8f3b-4058-a1b6-508ecaa27cb3",
    label: "v-gen:form.higgsfield_motion.option.levitation2",
    value: "b03ec615-8f3b-4058-a1b6-508ecaa27cb3",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/0c3977bd-8797-48f2-a15b-ab0ee5e3436e.webp",
    },
  },
  {
    id: "dfeb0656-5d12-474c-87cd-1c80e94abdf2",
    label: "v-gen:form.higgsfield_motion.option.mouth_in1",
    value: "dfeb0656-5d12-474c-87cd-1c80e94abdf2",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/54d03a6c-f612-4086-9ddf-c8668dcef1ca.webp",
    },
  },
  {
    id: "7351a8ad-9754-4844-94f1-00baf293d588",
    label: "v-gen:form.higgsfield_motion.option.mouth_in2",
    value: "7351a8ad-9754-4844-94f1-00baf293d588",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/ab6dbb88-b7f9-4260-8dff-7c23ef4088d7.webp",
    },
  },
  {
    id: "e974bca9-c9eb-4cc8-9318-5676cc110f17",
    label: "v-gen:form.higgsfield_motion.option.building_explosion1",
    value: "e974bca9-c9eb-4cc8-9318-5676cc110f17",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/5d4e4106-9149-4761-9973-00cb66253357.webp",
    },
  },
  {
    id: "0d53b135-337d-4918-aaf4-2af7ecf4f045",
    label: "v-gen:form.higgsfield_motion.option.building_explosion2",
    value: "0d53b135-337d-4918-aaf4-2af7ecf4f045",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/fa046def-4349-42fa-90d5-2b5df108b598.webp",
    },
  },
  {
    id: "52101885-ad45-4469-a885-ced767318452",
    label: "v-gen:form.higgsfield_motion.option.thunder_god1",
    value: "52101885-ad45-4469-a885-ced767318452",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/d51e65ac-5132-41dc-b70d-a4a574c35c77.webp",
    },
  },
  {
    id: "ca0568ee-6a0f-4134-a4ee-97dfe44753ba",
    label: "v-gen:form.higgsfield_motion.option.thunder_god2",
    value: "ca0568ee-6a0f-4134-a4ee-97dfe44753ba",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/1abf9bb7-8dfd-42b1-80a8-9ebd48e10487.webp",
    },
  },
  {
    id: "d8c13031-7117-4a3d-9a30-6a00d0d408b4",
    label: "v-gen:form.higgsfield_motion.option.melting1",
    value: "d8c13031-7117-4a3d-9a30-6a00d0d408b4",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/208e5e19-956c-48a2-afb7-8ca822c29a23.webp",
    },
  },
  {
    id: "ed15397e-0a3d-49e3-add4-b9529698a8ad",
    label: "v-gen:form.higgsfield_motion.option.melting2",
    value: "ed15397e-0a3d-49e3-add4-b9529698a8ad",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/b54b7f22-f4cf-4c9e-928c-fa6a8e6a3a9c.webp",
    },
  },
  {
    id: "28a4d3d3-613a-4796-9f40-f68c7646ded5",
    label: "v-gen:form.higgsfield_motion.option.invisible1",
    value: "28a4d3d3-613a-4796-9f40-f68c7646ded5",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/7e036ad6-e8f6-423e-b4a9-027b13c68e7c.webp",
    },
  },
  {
    id: "30802f12-3db4-49b8-b0ab-6f0c737b252e",
    label: "v-gen:form.higgsfield_motion.option.invisible2",
    value: "30802f12-3db4-49b8-b0ab-6f0c737b252e",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/404c4be5-ea7d-46b2-9d56-3ab61e69972b.webp",
    },
  },
  {
    id: "8fccea16-08b5-432c-8123-8456523e2d60",
    label: "v-gen:form.higgsfield_motion.option.tentacles1",
    value: "8fccea16-08b5-432c-8123-8456523e2d60",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/1539a8fe-26e4-4ef5-9b8f-dfd1862b6625.webp",
    },
  },
  {
    id: "df6600e1-387d-44e8-a8cb-96762a6ee8de",
    label: "v-gen:form.higgsfield_motion.option.tentacles2",
    value: "df6600e1-387d-44e8-a8cb-96762a6ee8de",
    payload: {
      image:
        "https://d1xarpci4ikg0w.cloudfront.net/2cc32411-1505-4970-9cb3-948a9519184c.webp",
    },
  },
];
/****************************************************** Vidu V2 ******************************************************/
export const VIDU_V2_TYPE_OPTION = [
  {
    id: 1,
    label: "v-gen:form.vidu_v2_type.option.image_to_video",
    value: "image_to_video",
  },
  {
    id: 2,
    label: "v-gen:form.vidu_v2_type.option.head_tail_to_video",
    value: "head_tail_to_video",
  },
  {
    id: 3,
    label: "v-gen:form.vidu_v2_type.option.character_to_video",
    value: "character_to_video",
  },
  {
    id: 4,
    label: "v-gen:form.vidu_v2_type.option.scene_to_video",
    value: "scene_to_video",
  },
];
export const VIDU_V2_RESOLUTION_OPTION: OptionProps[] = [
  { id: 1, label: "v-gen:form.vidu_v2_resolution.option.360p", value: "360p" },
  { id: 2, label: "v-gen:form.vidu_v2_resolution.option.720p", value: "720p" },
  {
    id: 3,
    label: "v-gen:form.vidu_v2_resolution.option.1080p",
    value: "1080p",
  },
];
export const VIDU_V2_MOVEMENT_AMPLITUDE_OPTION: OptionProps[] = [
  {
    id: 0,
    label: "v-gen:form.vidu_v2_movement_amplitude.option.auto",
    value: "auto",
  },
  {
    id: 1,
    label: "v-gen:form.vidu_v2_movement_amplitude.option.low",
    value: "low",
  },
  {
    id: 2,
    label: "v-gen:form.vidu_v2_movement_amplitude.option.medium",
    value: "medium",
  },
  {
    id: 3,
    label: "v-gen:form.vidu_v2_movement_amplitude.option.large",
    value: "large",
  },
];
export const VIDU_V2_ASPECT_RATIO_OPTION: OptionProps[] = [
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
  { id: 3, label: "v-gen:form.vidu_v2_aspect_ratio.option.1_1", value: "1:1" },
];
export const VIDU_V2_TEMPLATE_OPTION: OptionProps[] = [
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.muscling",
    value: "muscling",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/bianshenjirounan_viseo.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.captain_america",
    value: "captain_america",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/bianshenmeidui_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.hulk",
    value: "hulk",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/bianshenhaoke_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.cap_walk",
    value: "cap_walk",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/meiduitongxing_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.hulk_dive",
    value: "hulk_dive",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/haokefuchong_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.exotic_princess",
    value: "exotic_princess",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/yiyugongzhu_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.beast_companion",
    value: "beast_companion",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/yushouweiwu_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.cartoon_doll",
    value: "cartoon_doll",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/0317/Qwanou_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.mecha_x",
    value: "mecha_x",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/0331/guonei/jiqiren_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.ghibli",
    value: "ghibli",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/jibuli_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.minecraft",
    value: "minecraft",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/mc_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.style_me",
    value: "style_me",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/zhifuyouhuo_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.saber_warrior",
    value: "saber_warrior",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/saberwarrior_0428/saberwarrior_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.pet2human",
    value: "pet2human",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/pet2human_0509/pet2human_video1.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.clayshot",
    value: "clayshot",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/clayshot_0509/clayshot_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.french_kiss",
    value: "french_kiss",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Interactive/fashirewen_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.hugging",
    value: "hugging",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Interactive/Interactive/hugging_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.kissing",
    value: "kissing",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Interactive/Interactive/kissing_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.interaction",
    value: "interaction@",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Interactive/Interactive/bixin_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.interaction_rose",
    value: "interaction@rose",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Interactive/Interactive/rose_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.hugging_pro",
    value: "hugging_pro",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Interactive/Interactive/0331/guonei/yongbaopro_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.kissing_pro",
    value: "kissing_pro",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Interactive/Interactive/0331/guonei/qinwenpro_vodeo.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.rain_kiss",
    value: "rain_kiss",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Interactive/Interactive/yuzhongrewen_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.bloom_magic",
    value: "bloom_magic",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Creative/Creative/wanwushenghua_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.bloom_doorobear",
    value: "bloom_doorobear",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Creative/Creative/0324/mengyaxiong_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.smooth_shift",
    value: "smooth_shift",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Creative/Creative/sihuazhaunchang_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.box_me",
    value: "box_me",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Creative/buluohezi_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.manga_meme",
    value: "manga_meme",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Creative/Creative/mangameme_0509/mangameme_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.golden_epoch",
    value: "golden_epoch",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/liujinsuiyue_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.oscar_gala",
    value: "oscar_gala",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Portrait/Portrait/jinxiangshengdian_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.fashion_stride",
    value: "fashion_stride",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Portrait/Portrait/shishangTtai_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.star_carpet",
    value: "star_carpet",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Portrait/Portrait/xingguanghongtan_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.flame_carpet",
    value: "flame_carpet",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Portrait/Portrait/lieyanhongtan_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.frost_carpet",
    value: "frost_carpet",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Portrait/Portrait/fengxuehongtan_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.tap_me",
    value: "tap_me",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Portrait/Portrait/jiaodaixiezhen_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.sakura_season",
    value: "sakura_season",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/yinghuapiaoluo_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.christmas",
    value: "christmas@",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/bianshengdanlaoren_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.christmas_gift",
    value: "christmas@gift",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/shengdansongli_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.christmas_cup",
    value: "christmas@cup",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/jubeiqingzhu_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.christmas_hug",
    value: "christmas@hug",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/shengdanyongbao_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.lunar_newyear",
    value: "lunar_newyear@",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/2025xinnianyanhua_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.lunar_newyear_couple",
    value: "lunar_newyear@couple",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/shuangrenjubei_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.lunar_newyear_envelope",
    value: "lunar_newyear@envelope",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/0325_cn/0325_cn/hongbaoyu_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.love_pose",
    value: "love_pose",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/quanjiafubixin_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.wish_sender",
    value: "wish_sender@",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/0325_cn/0325_cn/caishenbixin_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.wish_sender_hug",
    value: "wish_sender@hug",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/0325_cn/0325_cn/caishenyongbao_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.wish_sender_yuanbao",
    value: "wish_sender@yuanbao",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/0325_cn/0325_cn/caishenyuanbao_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.wish_sender_envelope",
    value: "wish_sender@envelope",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/0325_cn/0325_cn/caishenhongbao_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.wish_sender_jinbi",
    value: "wish_sender@jinbi",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/0325_cn/0325_cn/caishenjinbi_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.dynasty_dress",
    value: "dynasty_dress",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/0325_cn/0325_cn/gufenghuanzhaung_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.youth_rewind",
    value: "youth_rewind",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/tongnianhuiyi_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.couple_arrival_hug",
    value: "couple_arrival@hug",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/0325_cn/0325_cn/coupleyongbao_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.dreamy_wedding",
    value: "dreamy_wedding",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/menghuanhunli_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.romantic_lift",
    value: "romantic_lift",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/lanmangongzhubao_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.sweet_proposal",
    value: "sweet_proposal",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/tianmiqiuhun_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.hulk_dive",
    value: "hulk_dive",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Transformation/Transformation/haokefuchong_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.couple_arrival_flower",
    value: "couple_arrival@flower",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/AIqinglvsonghua_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.couple_arrival_kiss",
    value: "couple_arrival@kiss",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/0325_cn/0325_cn/couplekiss_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.couple_arrival_handshake",
    value: "couple_arrival@handshake",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/0325_cn/0325_cn/coulpehuishou_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.cupid_arrow",
    value: "cupid_arrow",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/qiubite_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.pet_lovers",
    value: "pet_lovers",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Festival/Festival/mengchonglianren_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.slice_therapy",
    value: "slice_therapy",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/jieyaqieqie_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.morphlab_pengzhang",
    value: "morphlab@pengzhang",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/pengzhang_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.morphlab_nienie",
    value: "morphlab@nienie",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/nienie_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.morphlab_baozha",
    value: "morphlab@baozha",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/baozha_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.morphlab_ronghua",
    value: "morphlab@ronghua",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/ronghua_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.hair_swap",
    value: "hair_swap",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/huanfa_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.balloon_flyaway",
    value: "balloon_flyaway",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/bianqiqiufeizou_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.flying",
    value: "flying",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/0317/flying_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.paperman",
    value: "paperman",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/0317/zhipianren_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.pinch",
    value: "pinch",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/0317/nienie_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.gender_swap",
    value: "gender_swap",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/0331/guonei/xingzhuan_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.nap_me",
    value: "nap_me",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/0331/guonei/daxiaoshui_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.sexy_me",
    value: "sexy_me",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/0331/guonei/bijini_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.paper_fall",
    value: "paper_fall",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/tanruanzaidi_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.claw_me",
    value: "claw_me",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Funny/Funny/zhuawawa_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.live_photo_tianmei",
    value: "live_photo@tianmei",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/tianmeiweixiao_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.emotionlab_kongju",
    value: "emotionlab@kongju",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/0325_cn/0325_cn/kongju_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.emotionlab_weixiao",
    value: "emotionlab@weixiao",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/0325_cn/0325_cn/weixiao_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.emotionlab_kuangxiao",
    value: "emotionlab@kuangxiao",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/0325_cn/0325_cn/kuangxiao_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.emotionlab_jingya",
    value: "emotionlab@jingya",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/0325_cn/0325_cn/jingya_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.live_photo_fengdong",
    value: "live_photo@fengdong",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/0325_cn/0325_cn/fengdong_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.live_photo_jingtoudong",
    value: "live_photo@jingtoudong",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/0325_cn/0325_cn/jingtoudong_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.live_photo_zoulu",
    value: "live_photo@zoulu",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/0325_cn/0325_cn/zoulu_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.live_memory",
    value: "live_memory",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/0325_cn/0325_cn/laozhaopian_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.bodyshake",
    value: "bodyshake",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/zhuanshenrewu_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.spin360",
    value: "spin360",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/360xuanzhuan_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.orbit",
    value: "orbit",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Ecommerce/0324/jingtouhuanrao_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.zoom_in",
    value: "zoom_in",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Ecommerce/0324/jingtoutuijin_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.ai_outfit",
    value: "ai_outfit",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Ecommerce/0324/shiyi-nei/xunishiyi_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.spin180",
    value: "spin180",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Dynamic/Dynamic/180xuanzhuan_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.orbit_dolly",
    value: "orbit_dolly",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Ecommerce/0425/orbitdolly_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.orbit_dolly_fast",
    value: "orbit_dolly_fast",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Ecommerce/0425/orbitdollyfast_video.mp4",
    },
  },
  {
    id: nanoid(),
    label: "v-gen:form.vidu_v2_template.option.auto_spin",
    value: "auto_spin",
    payload: {
      video:
        "https://image01.vidu.zone/vidu-maas/scene-template/Template_material/Ecommerce/0425/autospin_video.mp4",
    },
  },
];
