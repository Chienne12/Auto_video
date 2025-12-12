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

interface Veo3ProFormProps {
  setIsReady: (isReady: boolean) => void;
  setShowFields: (showFields: string[]) => void;
  modelValue: string;

  errors: FieldErrors<FieldValues>;
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export function Veo3ProForm({
  setIsReady,
  setShowFields,
  errors,
  register,
  getValues,
  setValue,
  watch,
  modelValue,
}: Veo3ProFormProps) {
  const { t } = useClientTranslation();

  const veo3ProPrompt = watch("veo3ProPrompt");

  const active = modelValue === "veo3_pro";

  useEffect(() => {
    if (active) {
      setIsReady(!!veo3ProPrompt);
      setShowFields(["model", "veo3ProPrompt"]);
    }
  }, [setIsReady, veo3ProPrompt, active, setShowFields]);

  return (
    <div
      className={cn("flex flex-col space-y-2", {
        hidden: !active,
      })}
    >
      <FormGenerator
        name="veo3ProPrompt"
        className={cn("flex w-full flex-col space-y-2")}
        label={t("v-gen:form.veo3_pro_prompt.title")}
        placeholder={t("v-gen:form.veo3_pro_prompt.desc")}
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
