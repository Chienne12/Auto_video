/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";

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

interface MJVideoFormProps {
  setIsReady: (isReady: boolean) => void;
  setShowFields: (showFields: string[]) => void;
  modelValue: string;

  errors: FieldErrors<FieldValues>;
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export function MJVideoForm({
  setIsReady,
  setShowFields,
  errors,
  register,
  getValues,
  setValue,
  watch,
  modelValue,
}: MJVideoFormProps) {
  const { t } = useClientTranslation();

  const mjVideoPrompt = watch("mjVideoPrompt");
  const mjVideoMotion = watch("mjVideoMotion");
  const mjVideoImage = watch("mjVideoImage");

  const active = modelValue === "mj_video";

  useEffect(() => {
    if (active) {
      setIsReady(!!mjVideoPrompt && !!mjVideoMotion && !!mjVideoImage);
      setShowFields([
        "model",
        "mjVideoPrompt",
        "mjVideoMotion",
        "mjVideoImage",
      ]);
    }
  }, [
    setIsReady,
    mjVideoPrompt,
    mjVideoMotion,
    mjVideoImage,
    active,
    setShowFields,
  ]);

  return (
    <div
      className={cn("flex flex-col space-y-2", {
        hidden: !active,
      })}
    >
      <FormGenerator
        name="mjVideoPrompt"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.mj_video_prompt.title")}
        placeholder={t("v-gen:form.mj_video_prompt.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="textarea"
        textareaRows={3}
      />
      <FormGenerator
        name="mjVideoMotion"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.mj_video_motion.title")}
        placeholder={t("v-gen:form.mj_video_motion.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="select"
        selectOptions={[
          { label: t("v-gen:form.mj_video_motion.low"), value: "low", id: 1 },
          { label: t("v-gen:form.mj_video_motion.high"), value: "high", id: 2 },
        ]}
      />
      <FormGenerator
        name="mjVideoImage"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.mj_video_image.title")}
        placeholder={t("v-gen:form.mj_video_image.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="upload"
      />
    </div>
  );
}
