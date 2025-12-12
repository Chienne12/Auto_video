/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";

import { nanoid } from "nanoid";
import {
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import FormGenerator from "@/components/common/form-generator";
import { useClientTranslation } from "@/hooks/global";
import { cn } from "@/lib/utils";

interface KlingV21FormProps {
  setIsReady: (isReady: boolean) => void;
  setShowFields: (showFields: string[]) => void;
  modelValue: string;

  errors: FieldErrors<FieldValues>;
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export function KlingV21Form({
  setIsReady,
  setShowFields,
  errors,
  register,
  getValues,
  setValue,
  watch,
  modelValue,
}: KlingV21FormProps) {
  const { t } = useClientTranslation();

  const klingV21Type = watch("klingV21Type");
  const klingV21Version = watch("klingV21Version");
  const klingV21Image = watch("klingV21Image");
  const klingV21Prompt = watch("klingV21Prompt");
  const klingV21Cfg = watch("klingV21Cfg");
  const klingV21AspectRatio = watch("klingV21AspectRatio");
  const klingV21Duration = watch("klingV21Duration");

  const active = modelValue === "kling_21";
  const isImageToVideo = klingV21Type === "image_to_video";
  const isMaster = klingV21Version === "master";

  const getKlingV21TypeOptions = () => {
    const baseOptions = [
      {
        id: nanoid(),
        label: t("v-gen:form.kling_v21_type.option.image_to_video"),
        value: "image_to_video",
      },
    ];

    if (isMaster) {
      baseOptions.push({
        id: nanoid(),
        label: t("v-gen:form.kling_v21_type.option.text_to_video"),
        value: "text_to_video",
      });
    }

    return baseOptions;
  };

  useEffect(() => {
    if (active && !isMaster && klingV21Type !== "image_to_video") {
      setValue("klingV21Type", "image_to_video");
    }
  }, [isMaster, setValue, klingV21Type, active]);

  useEffect(() => {
    if (active) {
      setShowFields([
        "model",
        "klingV21Type",
        "klingV21Version",
        isImageToVideo ? "klingV21Image" : "",
        "klingV21Prompt",
        "klingV21Cfg",
        "klingV21AspectRatio",
        "klingV21Duration",
      ]);

      setIsReady(isImageToVideo ? !!klingV21Image : !!klingV21Prompt);
    }
  }, [
    setIsReady,
    setShowFields,
    klingV21Type,
    klingV21Version,
    klingV21Image,
    klingV21Prompt,
    klingV21Cfg,
    klingV21AspectRatio,
    klingV21Duration,
    active,
    isImageToVideo,
  ]);

  return (
    <div
      className={cn("flex flex-col space-y-2", {
        hidden: !active,
      })}
    >
      <FormGenerator
        name="klingV21Type"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.kling_v21_type.title")}
        placeholder={t("v-gen:form.kling_v21_type.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="select"
        selectOptions={getKlingV21TypeOptions()}
      />

      <FormGenerator
        name="klingV21Prompt"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.kling_v21_prompt.title")}
        placeholder={t("v-gen:form.kling_v21_prompt.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="textarea"
        textareaRows={3}
      />

      <FormGenerator
        name="klingV21NegativePrompt"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.kling_v21_negative_prompt.title")}
        placeholder={t("v-gen:form.kling_v21_negative_prompt.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="textarea"
        textareaRows={3}
      />

      <FormGenerator
        name="klingV21Version"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.kling_v21_version.title")}
        placeholder={t("v-gen:form.kling_v21_version.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="select"
        selectOptions={[
          {
            id: nanoid(),
            label: t("v-gen:form.kling_v21_version.option.common"),
            value: "common",
          },
          {
            id: nanoid(),
            label: t("v-gen:form.kling_v21_version.option.hq"),
            value: "hq",
          },
          {
            id: nanoid(),
            label: t("v-gen:form.kling_v21_version.option.master"),
            value: "master",
          },
        ]}
      />

      <FormGenerator
        name="klingV21Image"
        className={cn("flex w-full flex-col space-y-2", {
          hidden: klingV21Type !== "image_to_video",
        })}
        label={t("v-gen:form.kling_v21_image.title")}
        placeholder={t("v-gen:form.kling_v21_image.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="upload"
        uploadAccept="image/jpeg,image/jpg,image/png"
      />

      <FormGenerator
        name="klingV21Cfg"
        className={cn("flex w-full flex-col space-y-7")}
        label={t("v-gen:form.kling_v21_cfg.title")}
        placeholder={t("v-gen:form.kling_v21_cfg.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="slider"
        sliderConfig={{
          min: 0.0,
          max: 1.0,
          step: 0.1,
          showCurrentValue: true,
        }}
      />

      <FormGenerator
        name="klingV21AspectRatio"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.kling_v21_aspect_ratio.title")}
        placeholder={t("v-gen:form.kling_v21_aspect_ratio.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="select"
        selectOptions={[
          {
            id: nanoid(),
            label: "v-gen:form.kling_v21_aspect_ratio.option.1_1",
            value: "1:1",
          },
          {
            id: nanoid(),
            label: "v-gen:form.kling_v21_aspect_ratio.option.16_9",
            value: "16:9",
          },
          {
            id: nanoid(),
            label: "v-gen:form.kling_v21_aspect_ratio.option.9_16",
            value: "9:16",
          },
        ]}
      />

      <FormGenerator
        name="klingV21Duration"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.kling_v21_duration.title")}
        placeholder={t("v-gen:form.kling_v21_duration.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="select"
        selectOptions={[
          {
            id: nanoid(),
            label: t("v-gen:form.kling_v21_duration.option.5"),
            value: "5",
          },
          {
            id: nanoid(),
            label: t("v-gen:form.kling_v21_duration.option.10"),
            value: "10",
          },
        ]}
      />
    </div>
  );
}
