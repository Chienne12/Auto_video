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

interface Veo3FastFormProps {
  setIsReady: (isReady: boolean) => void;
  setShowFields: (showFields: string[]) => void;
  modelValue: string;

  errors: FieldErrors<FieldValues>;
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export function Veo3FastForm({
  setIsReady,
  setShowFields,
  errors,
  register,
  getValues,
  setValue,
  watch,
  modelValue,
}: Veo3FastFormProps) {
  const { t } = useClientTranslation();

  const veo3FastPrompt = watch("veo3FastPrompt");

  const active = modelValue === "veo3_fast";

  useEffect(() => {
    if (active) {
      setIsReady(!!veo3FastPrompt);
      setShowFields(["model", "veo3FastPrompt"]);
    }
  }, [setIsReady, veo3FastPrompt, active, setShowFields]);

  return (
    <div
      className={cn("flex flex-col space-y-2", {
        hidden: !active,
      })}
    >
      <FormGenerator
        name="veo3FastPrompt"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.veo3_fast_prompt.title")}
        placeholder={t("v-gen:form.veo3_fast_prompt.desc")}
        watch={watch}
        register={register}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        type="textarea"
        textareaRows={3}
      />
    </div>
  );
}
