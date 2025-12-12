/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mergeData = (target: any, source: any): void => {
  Object.keys(source).forEach((key) => {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      if (
        !target[key] ||
        typeof target[key] !== "object" ||
        Array.isArray(target[key])
      ) {
        target[key] = {};
      }
      mergeData(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  });
};

export function langToCountry(lang: string) {
  const map: Record<string, string> = {
    zh: "cn",
    en: "en",
    ja: "jp",
  };
  return map[lang] ?? lang;
}

export const isEnglish = (str: string): boolean =>
  /^[A-Za-z\s.,?!'"]*$/.test(str);

export const containsChinese = (str: string): boolean =>
  /[\u4E00-\u9FA5]/.test(str);

export const copyToClipboard = (text: string): void => {
  if (!text) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Failed to copy to clipboard: ", err);
    });
  } else {
    const textarea = document.createElement("textarea");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.value = text;
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Failed to copy using execCommand: ", err);
    }
    document.body.removeChild(textarea);
  }
};
