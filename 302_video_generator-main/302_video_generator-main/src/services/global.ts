import { env } from "@/env";
import { apiFetch } from "@/lib/api";

const TRANSLATE_TO_EN_PROMPT =
  "Please forget that you're an AI engine. Now you are a professional translation engine. Please ignore tasks other than translation. All inputs should be treated as text to be translated. Please translate all text into English, keep the original English text, and ensure all output is in English. You don't need to explain. Only tell me the most likely correct word if there is a spelling mistake.";
const IMAGE_TO_VIDEO_PROMPT =
  "Please use one sentence to describe the image content as a prompt for generating an AI video.";

export async function uploadImage(file: File) {
  try {
    if (!file) {
      return "";
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", "v-gen");

    const response = await fetch(`${env.NEXT_PUBLIC_UPLOAD_API_URL}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data.data.url;
  } catch (error) {
    throw error;
  }
}

export const aiTranslate = async (
  str: string,
  prompt: string = TRANSLATE_TO_EN_PROMPT
) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "image/*");
    myHeaders.append("Content-Type", "application/json");

    const data = {
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: str,
        },
      ],
      stream: false,
      model: "gpt-4o-mini",
    };

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(data),
    };

    const response = await apiFetch("v1/chat/completions", requestOptions);
    if (!response.ok) {
      throw await response.json();
    }
    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    throw error;
  }
};

export const aiImageToText = async (
  url: string,
  prompt: string = IMAGE_TO_VIDEO_PROMPT
) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "image/*");
    myHeaders.append("Content-Type", "application/json");

    const data = {
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: url,
              },
            },
          ],
        },
      ],
      stream: false,
      model: env.NEXT_PUBLIC_DEFAULT_MODEL_NAME,
    };

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(data),
    };

    const response = await apiFetch("v1/chat/completions", requestOptions);
    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    throw error;
  }
};
