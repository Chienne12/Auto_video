"use client";

/* eslint-disable @next/next/no-img-element */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useCallback, useState } from "react";

import { ErrorMessage } from "@hookform/error-message";
import { CircleX, HelpCircle, Loader2, UploadIcon } from "lucide-react";
import type {
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast, useClientTranslation, useIsMobile } from "@/hooks/global";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/services/global";

import TransRenderer from "../trans-renderer";

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

type FormGeneratorProps = {
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
  selectOptions?: {
    value: string;
    label: string;
    id: number | string;
    payload?: {
      image?: string;
      video?: string;
    };
  }[];
  textareaRows?: number;
  className?: string;
  errors: FieldErrors<FieldValues>;
  register: UseFormRegister<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  watch: (name: string, defaultValue: any) => any;
  sliderConfig?: SliderConfig;
  selectConfig?: SelectConfig;
  uploadAccept?: string;
};

const FormGenerator = ({
  name,
  label,
  placeholder,
  type,
  inputType = "text",
  selectOptions,
  textareaRows,
  className,
  errors,
  register,
  getValues,
  setValue,
  watch,
  sliderConfig,
  selectConfig,
  uploadAccept = "image/*",
}: FormGeneratorProps) => {
  const { t } = useClientTranslation();
  const [dragEnter, setDragEnter] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const isMobile = useIsMobile();

  const handleFileDrop = useCallback(
    async (files: FileList) => {
      const file = files[0];
      if (file) {
        if (uploadAccept !== "image/*") {
          const acceptedTypes = uploadAccept
            .split(",")
            .map((type) => type.trim());
          const fileType = file.type;
          const isAccepted = acceptedTypes.some((acceptType) => {
            if (acceptType.startsWith(".")) {
              const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
              return fileExtension === acceptType;
            } else {
              return fileType === acceptType;
            }
          });

          if (!isAccepted) {
            toast({
              title: t("global:status.file_type_not_accepted"),
              variant: "destructive",
            });
            console.error("File type not accepted:", fileType);
            return;
          }
        }

        try {
          setIsUploading(true);
          const url = await uploadImage(file);
          setValue(name, url);
        } catch (error) {
          console.error("Upload failed:", error);
        } finally {
          setIsUploading(false);
        }
      }
    },
    [name, setValue, t, uploadAccept]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragEnter(true);
  };

  const handleDragLeave = () => {
    setDragEnter(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragEnter(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileDrop(event.dataTransfer.files);
    }
  };

  const clearFile = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setValue(name, null);
  };

  const renderErrorMessage = () => (
    <ErrorMessage
      errors={errors}
      name={name}
      render={({ message }) =>
        message !== "Required" && (
          <p className="mt-2 text-red-400">
            <TransRenderer content={message} />
          </p>
        )
      }
    />
  );

  const renderInput = () => (
    <Label htmlFor={`input-${name}`} className={className}>
      <p>{label && t(label)}</p>
      <Input
        className={className}
        id={`input-${name}`}
        type={inputType}
        placeholder={placeholder && t(placeholder)}
        {...register(name)}
      />
      {renderErrorMessage()}
    </Label>
  );

  const renderTextarea = () => (
    <Label htmlFor={`textarea-${name}`} className={className}>
      <p>{label && t(label)}</p>
      <Textarea
        id={`textarea-${name}`}
        placeholder={placeholder && t(placeholder)}
        {...register(name)}
        rows={textareaRows}
      />
      {renderErrorMessage()}
    </Label>
  );

  const renderSelect = () => {
    const currentValue = watch(name, getValues(name));

    return (
      <Label htmlFor={`select-${name}`} className={className}>
        <p>{label && t(label)}</p>
        <Select
          name={name}
          value={currentValue}
          onValueChange={(value) => {
            setValue(name, value);
          }}
        >
          <SelectTrigger id={`select-${name}`}>
            <SelectValue placeholder={placeholder && t(placeholder)} />
          </SelectTrigger>
          <SelectContent position="popper">
            {selectOptions?.map((option) =>
              !isMobile && selectConfig?.showImage ? (
                <TooltipProvider key={option.value}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SelectItem value={option.value}>
                        <p>{t(option.label)}</p>
                      </SelectItem>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="overflow-hidden rounded-md border p-0"
                    >
                      {option.payload?.image && (
                        <img
                          src={option.payload.image}
                          alt={t(option.label)}
                          className="max-h-[500px] object-contain"
                        />
                      )}
                      {option.payload?.video && (
                        // biome-ignore lint/a11y/useMediaCaption: <explanation>
                        <video
                          src={option.payload.video}
                          playsInline
                          className="max-h-[500px] object-contain"
                          loop
                          autoPlay
                        />
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <SelectItem value={option.value} key={option.value}>
                  <p>{t(option.label)}</p>
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        {renderErrorMessage()}
      </Label>
    );
  };

  const renderCheckbox = () => {
    const watchCheckbox = watch(name, true);
    return (
      <Label
        className={cn("flex gap-2", className)}
        htmlFor={`checkbox-${label}`}
      >
        <Checkbox
          id={`checkbox-${name}`}
          {...register(name)}
          checked={watchCheckbox}
          onCheckedChange={(checked) => setValue(name, checked)}
        />
        {label && t(label)}
      </Label>
    );
  };

  const renderUpload = () => {
    const imageURL = watch(name, getValues(name));
    return (
      <Label htmlFor={`upload-${name}`} className={className}>
        <p>{label && t(label)}</p>
        {imageURL ? (
          <div className="relative w-full rounded-md bg-background p-2">
            <img
              width={100}
              height={100}
              src={imageURL}
              // biome-ignore lint/a11y/noRedundantAlt: <explanation>
              alt="first image"
              style={{ width: "100%", height: "auto" }}
            />
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              className="absolute right-0 top-0 hover:scale-110"
              onClick={clearFile}
            >
              <CircleX className="cursor-pointer rounded-full bg-red-100 text-xl text-red-500" />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "relative rounded-lg border-2 border-dashed p-2 text-slate-500 hover:border-primary hover:text-primary",
              {
                "border-gray-400": !dragEnter,
                "border-primary text-primary": dragEnter,
                "pointer-events-none opacity-50": isUploading,
              }
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex w-full flex-col items-center justify-center rounded-lg p-1">
              <input
                id={`upload-${name}`}
                type="file"
                accept={uploadAccept}
                onChange={(e) =>
                  e.target.files && handleFileDrop(e.target.files)
                }
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <UploadIcon />
              )}
              <p className="mt-2 text-center">
                {isUploading
                  ? t("global:status.uploading")
                  : placeholder && t(placeholder)}
              </p>
            </div>
          </div>
        )}
        {renderErrorMessage()}
      </Label>
    );
  };

  const renderSwitch = () => {
    const watchSwitch = watch(name, false);

    return (
      <Label
        className={cn("flex items-center justify-between gap-2", className)}
        htmlFor={`switch-${name}`}
      >
        <div className="flex w-full items-center justify-between">
          <p>{label && t(label)}</p>
          <Switch
            id={`switch-${name}`}
            checked={watchSwitch}
            onCheckedChange={(checked) => {
              setValue(name, checked);
            }}
          />
        </div>
      </Label>
    );
  };

  const renderSlider = () => {
    const watchSlider = watch(name, 0);

    const hasDoubleLabel =
      (typeof sliderConfig?.minLabel === "object" &&
        sliderConfig?.minLabel.bottom) ||
      (typeof sliderConfig?.maxLabel === "object" &&
        sliderConfig?.maxLabel.bottom);

    const hasStepLabels =
      !!sliderConfig?.stepLabels && sliderConfig.stepLabels.length > 0;

    const renderStepLabels = () => {
      if (!sliderConfig?.stepLabels) return null;

      return (
        <div className="absolute -top-6 flex w-full justify-between">
          {sliderConfig.stepLabels.map((step) => {
            const position =
              ((step.value - (sliderConfig.min || 0)) /
                ((sliderConfig.max || 1) - (sliderConfig.min || 0))) *
              100;
            let style: React.CSSProperties = {};

            if (position <= 0) {
              style = { left: "0%", transform: "translateX(0)" };
            } else if (position >= 100) {
              style = { right: "0%", transform: "translateX(0)" };
            } else {
              style = { left: `${position}%`, transform: "translateX(-50%)" };
            }

            return (
              <div
                key={step.value}
                className="absolute flex flex-col items-center"
                style={style}
              >
                {step.topLabel && (
                  <span className="text-xs text-muted-foreground">
                    {step.topLabel}
                  </span>
                )}
                {step.bottomLabel && (
                  <div className="absolute top-8 text-xs text-muted-foreground">
                    {step.bottomLabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    };

    const renderLabel = () => (
      <div className="flex items-center gap-2">
        <p className="shrink-0">{label && t(label)}</p>
        {sliderConfig?.tooltip && renderTooltip(sliderConfig.tooltip)}
      </div>
    );

    const renderEdgeLabel = (label?: string | LabelConfig) => {
      if (!label) return null;

      if (typeof label === "string") {
        return (
          <div
            className={cn(
              "min-w-[40px] text-sm",
              hasDoubleLabel && "self-center"
            )}
          >
            {label}
          </div>
        );
      }

      return (
        <div className="flex min-w-[40px] flex-col items-center">
          {label.top && <div className="text-sm">{label.top}</div>}
          {label.bottom && (
            <div className="text-xs text-muted-foreground">{label.bottom}</div>
          )}
        </div>
      );
    };

    return (
      <Label htmlFor={`select-${name}`} className={cn(className)}>
        {label && renderLabel()}
        <div
          className={cn(
            "flex w-full flex-col",
            hasStepLabels ? "gap-6" : "gap-2",
            className
          )}
        >
          <div className="flex items-center gap-4">
            {sliderConfig?.showMinLabel && (
              <div
                className={cn(
                  "flex",
                  hasDoubleLabel ? "h-[40px] items-start" : "items-center"
                )}
              >
                {renderEdgeLabel(
                  sliderConfig.minLabel || `${sliderConfig?.min}`
                )}
              </div>
            )}

            <div
              className={cn("relative flex-1", hasDoubleLabel && "self-center")}
            >
              {sliderConfig?.fixedValues && (
                <div className="absolute -top-6 flex w-full justify-between">
                  {sliderConfig.fixedValues.map((value) => (
                    <span key={value.value} className="text-xs">
                      {value.label}
                    </span>
                  ))}
                </div>
              )}
              {renderStepLabels()}
              {sliderConfig?.showCurrentValue && (
                <div
                  className="absolute -top-6 text-xs"
                  style={{
                    left: `${((watchSlider - (sliderConfig.min || 0)) / ((sliderConfig.max || 100) - (sliderConfig.min || 0))) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {sliderConfig.formatValue
                    ? sliderConfig.formatValue(watchSlider)
                    : watchSlider}
                </div>
              )}

              <Slider
                value={[watchSlider]}
                min={sliderConfig?.min || 0}
                max={sliderConfig?.max || 100}
                step={
                  sliderConfig?.step ||
                  (sliderConfig?.fixedValues ? undefined : 1)
                }
                onValueChange={(value) => setValue(name, value[0])}
                {...(sliderConfig?.fixedValues && {
                  marks: sliderConfig.fixedValues.map((v) => v.value),
                })}
              />
            </div>

            {sliderConfig?.showMaxLabel && (
              <div
                className={cn(
                  "flex",
                  hasDoubleLabel ? "h-[40px] items-start" : "items-center"
                )}
              >
                {renderEdgeLabel(
                  sliderConfig.maxLabel || `${sliderConfig?.max}`
                )}
              </div>
            )}
          </div>
          {renderErrorMessage()}
        </div>
      </Label>
    );
  };

  const renderTooltip = (content: string) => (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <span
            className="cursor-help"
            onClick={(e) => e.preventDefault()}
            tabIndex={-1}
          >
            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-500" />
          </span>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={4}
          className="max-w-xs select-text break-words rounded-md bg-gray-900 px-3 py-2 text-sm text-gray-50"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  switch (type) {
    case "input":
      return renderInput();
    case "select":
      return renderSelect();
    case "textarea":
      return renderTextarea();
    case "checkbox":
      return renderCheckbox();
    case "upload":
      return renderUpload();
    case "switch":
      return renderSwitch();
    case "slider":
      return renderSlider();
    default:
      return null;
  }
};

export default FormGenerator;
