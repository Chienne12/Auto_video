/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from "react";

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

interface MinimaxHailuo02FormProps {
  setIsReady: (isReady: boolean) => void;
  setShowFields: (showFields: string[]) => void;
  modelValue: string;

  errors: FieldErrors<FieldValues>;
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export function MinimaxHailuo02Form({
  setIsReady,
  setShowFields,
  errors,
  register,
  getValues,
  setValue,
  watch,
  modelValue,
}: MinimaxHailuo02FormProps) {
  const { t } = useClientTranslation();

  const minimaxiHailuoPrompt = watch("minimaxiHailuoPrompt");
  const minimaxiHailuoPromptOptimizer = watch("minimaxiHailuoPromptOptimizer");
  const minimaxiHailuoDuration = watch("minimaxiHailuoDuration");
  const minimaxiHailuoResolution = watch("minimaxiHailuoResolution");

  const active = modelValue === "minimaxi_hailuo_02";

  // Dynamic duration options based on resolution
  const durationOptions = useMemo(() => {
    const allDurationOptions = [
      {
        id: nanoid(),
        label: t("v-gen:form.minimaxi_duration.option.six"),
        value: "6",
      },
      {
        id: nanoid(),
        label: t("v-gen:form.minimaxi_duration.option.ten"),
        value: "10",
      },
    ];

    if (minimaxiHailuoResolution === "768P") {
      return allDurationOptions; // 6, 10
    } else if (minimaxiHailuoResolution === "1080P") {
      return allDurationOptions.filter((option) => option.value === "6"); // 6 only
    }

    return allDurationOptions; // default: show all options
  }, [minimaxiHailuoResolution, t]);

  // Dynamic resolution options based on duration
  const resolutionOptions = useMemo(() => {
    const allResolutionOptions = [
      {
        id: nanoid(),
        label: t("v-gen:form.minimaxi_resolution.option.768p"),
        value: "768P",
      },
      {
        id: nanoid(),
        label: t("v-gen:form.minimaxi_resolution.option.1080p"),
        value: "1080P",
      },
    ];

    if (minimaxiHailuoDuration === "6") {
      return allResolutionOptions; // 768P, 1080P
    } else if (minimaxiHailuoDuration === "10") {
      return allResolutionOptions.filter((option) => option.value === "768P"); // 768P only
    }

    return allResolutionOptions; // default: show all options
  }, [minimaxiHailuoDuration, t]);

  // Handle option validation and clearing invalid selections
  useEffect(() => {
    if (!active) return;

    // Clear duration if it's not available for current resolution
    if (minimaxiHailuoResolution && minimaxiHailuoDuration) {
      const availableDurations = durationOptions.map((option) => option.value);
      if (!availableDurations.includes(minimaxiHailuoDuration)) {
        setValue("minimaxiHailuoDuration", "");
      }
    }

    // Clear resolution if it's not available for current duration
    if (minimaxiHailuoDuration && minimaxiHailuoResolution) {
      const availableResolutions = resolutionOptions.map(
        (option) => option.value
      );
      if (!availableResolutions.includes(minimaxiHailuoResolution)) {
        setValue("minimaxiHailuoResolution", "");
      }
    }
  }, [
    active,
    minimaxiHailuoDuration,
    minimaxiHailuoResolution,
    durationOptions,
    resolutionOptions,
    setValue,
  ]);

  useEffect(() => {
    if (active) {
      setIsReady(
        !!minimaxiHailuoPrompt &&
          !!minimaxiHailuoDuration &&
          !!minimaxiHailuoResolution
      );
      setShowFields([
        "model",
        "minimaxiHailuoPrompt",
        "minimaxiHailuoPromptOptimizer",
        "minimaxiHailuoDuration",
        "minimaxiHailuoResolution",
        "minimaxiHailuoFirstFrameImage",
      ]);
    }
  }, [
    setIsReady,
    minimaxiHailuoPrompt,
    minimaxiHailuoPromptOptimizer,
    minimaxiHailuoDuration,
    minimaxiHailuoResolution,
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
        name="minimaxiHailuoPrompt"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.minimaxi_hailuo_prompt.title")}
        placeholder={t("v-gen:form.minimaxi_hailuo_prompt.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="textarea"
        textareaRows={3}
      />
      <FormGenerator
        name="minimaxiHailuoPromptOptimizer"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.minimaxi_prompt_optimizer.title")}
        placeholder={t("v-gen:form.minimaxi_prompt_optimizer.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="switch"
      />
      <FormGenerator
        name="minimaxiHailuoDuration"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.minimaxi_duration.title")}
        placeholder={t("v-gen:form.minimaxi_duration.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="select"
        selectOptions={durationOptions}
      />
      <FormGenerator
        name="minimaxiHailuoResolution"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.minimaxi_resolution.title")}
        placeholder={t("v-gen:form.minimaxi_resolution.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="select"
        selectOptions={resolutionOptions}
      />
      <FormGenerator
        name="minimaxiHailuoFirstFrameImage"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.minimaxi_first_frame_image.title")}
        placeholder={t("v-gen:form.minimaxi_first_frame_image.desc")}
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
