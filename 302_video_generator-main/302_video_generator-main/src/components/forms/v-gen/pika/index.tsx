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

interface PikaFormProps {
  setIsReady: (isReady: boolean) => void;
  setShowFields: (showFields: string[]) => void;
  modelValue: string;

  errors: FieldErrors<FieldValues>;
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export function PikaForm({
  setIsReady,
  setShowFields,
  errors,
  register,
  getValues,
  setValue,
  watch,
  modelValue,
}: PikaFormProps) {
  const { t } = useClientTranslation();

  const pikaImage = watch("pikaImage");
  const pikaAffects = watch("pikaAffects");

  const active = modelValue === "pika";

  useEffect(() => {
    if (active) {
      setIsReady(!!(pikaImage && pikaAffects));
      setShowFields([
        "model",
        "pikaImage",
        "pikaPrompt",
        "pikaNegativePrompt",
        "pikaAffects",
      ]);
    }
  }, [setIsReady, pikaImage, active, setShowFields, pikaAffects]);

  return (
    <div
      className={cn("flex flex-col space-y-2", {
        hidden: !active,
      })}
    >
      <FormGenerator
        name="pikaImage"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.pika_image.title")}
        placeholder={t("v-gen:form.pika_image.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="upload"
      />
      <FormGenerator
        name="pikaPrompt"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.pika_prompt.title")}
        placeholder={t("v-gen:form.pika_prompt.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="textarea"
        textareaRows={3}
      />
      <FormGenerator
        name="pikaNegativePrompt"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.pika_negative_prompt.title")}
        placeholder={t("v-gen:form.pika_negative_prompt.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="textarea"
        textareaRows={3}
      />
      <FormGenerator
        name="pikaAffects"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.pika_affects.title")}
        placeholder={t("v-gen:form.pika_affects.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="select"
        selectOptions={[
          {
            label: t("v-gen:form.pika_affects.cake-ify"),
            value: "Cake-ify",
            id: 1,
          },
          {
            label: t("v-gen:form.pika_affects.crumble"),
            value: "Crumble",
            id: 2,
          },
          {
            label: t("v-gen:form.pika_affects.crush"),
            value: "Crush",
            id: 3,
          },
          {
            label: t("v-gen:form.pika_affects.decapitate"),
            value: "Decapitate",
            id: 4,
          },
          {
            label: t("v-gen:form.pika_affects.deflate"),
            value: "Deflate",
            id: 5,
          },
          {
            label: t("v-gen:form.pika_affects.dissolve"),
            value: "Dissolve",
            id: 6,
          },
          {
            label: t("v-gen:form.pika_affects.explode"),
            value: "Explode",
            id: 7,
          },
          {
            label: t("v-gen:form.pika_affects.eye-pop"),
            value: "Eye-pop",
            id: 8,
          },
          {
            label: t("v-gen:form.pika_affects.inflate"),
            value: "Inflate",
            id: 9,
          },
          {
            label: t("v-gen:form.pika_affects.levitate"),
            value: "Levitate",
            id: 10,
          },
          {
            label: t("v-gen:form.pika_affects.melt"),
            value: "Melt",
            id: 11,
          },
          {
            label: t("v-gen:form.pika_affects.peel"),
            value: "Peel",
            id: 12,
          },
          {
            label: t("v-gen:form.pika_affects.poke"),
            value: "Poke",
            id: 13,
          },
          {
            label: t("v-gen:form.pika_affects.squish"),
            value: "Squish",
            id: 14,
          },
          {
            label: t("v-gen:form.pika_affects.ta-da"),
            value: "Ta-da",
            id: 15,
          },
          {
            label: t("v-gen:form.pika_affects.tear"),
            value: "Tear",
            id: 16,
          },
        ]}
      />
    </div>
  );
}
