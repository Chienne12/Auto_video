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

interface Veo3ProFramesFormProps {
  setIsReady: (isReady: boolean) => void;
  setShowFields: (showFields: string[]) => void;
  modelValue: string;

  errors: FieldErrors<FieldValues>;
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export function Veo3ProFramesForm({
  setIsReady,
  setShowFields,
  errors,
  register,
  getValues,
  setValue,
  watch,
  modelValue,
}: Veo3ProFramesFormProps) {
  const { t } = useClientTranslation();

  const veo3ProFramesPrompt = watch("veo3ProFramesPrompt");
  const veo3ProFramesImage = watch("veo3ProFramesImage");

  const active = modelValue === "veo3_pro_frames";

  useEffect(() => {
    if (active) {
      setIsReady(!!veo3ProFramesPrompt && !!veo3ProFramesImage);
      setShowFields(["model", "veo3ProFramesPrompt", "veo3ProFramesImage"]);
    }
  }, [
    setIsReady,
    veo3ProFramesPrompt,
    veo3ProFramesImage,
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
        name="veo3ProFramesPrompt"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.veo3_pro_frames_prompt.title")}
        placeholder={t("v-gen:form.veo3_pro_frames_prompt.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="textarea"
        textareaRows={3}
      />
      <FormGenerator
        name="veo3ProFramesImage"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.veo3_pro_frames_image.title")}
        placeholder={t("v-gen:form.veo3_pro_frames_image.desc")}
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
