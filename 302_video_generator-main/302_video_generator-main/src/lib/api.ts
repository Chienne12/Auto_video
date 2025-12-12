"use client";

import { env } from "@/env";
import { useAppStore } from "@/stores";

import { langToCountry } from "./utils";

const apiAuth = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const url = `${env.NEXT_PUBLIC_AUTH_API_URL}/${endpoint}`;
  const { apiKey, language } = useAppStore.getState();

  const headers = new Headers(options?.headers);
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }
  if (language) {
    headers.set("Lang", langToCountry(language));
  }

  const response = await fetch(url, {
    ...options,
    headers: headers,
  });

  return response;
};

const apiFetch = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const url = `${env.NEXT_PUBLIC_FETCH_API_URL}/${endpoint}`;
  const { apiKey, language } = useAppStore.getState();

  const headers = new Headers(options?.headers);
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }
  if (language) {
    headers.set("Lang", langToCountry(language));
  }

  const response = await fetch(url, {
    ...options,
    headers: headers,
  });

  return response;
};

export { apiAuth, apiFetch };
