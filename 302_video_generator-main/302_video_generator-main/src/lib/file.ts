/* eslint-disable @typescript-eslint/no-explicit-any */
interface CompressOptions {
  maxSizeMB: number;
  mimeType?: string;
  quality?: number;
}

export default class FileManager {
  static compressImageBlob = (
    blob: Blob,
    maxSizeMB: number,
    mimeType: string,
    quality: number
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Failed to get 2D context"));

          let width = img.width;
          let height = img.height;

          while ((width * height * 4) / (1024 * 1024) > maxSizeMB) {
            width /= 1.1;
            height /= 1.1;
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
          }

          canvas.toBlob(
            (compressedBlob) => {
              if (compressedBlob) resolve(compressedBlob);
              else reject(new Error("Failed to compress image"));
            },
            mimeType,
            quality
          );
        };
        img.onerror = reject;
        img.src = String(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  static compressImage = (
    file: File,
    options: CompressOptions
  ): Promise<Blob> => {
    const { maxSizeMB, mimeType = "image/jpeg", quality = 0.8 } = options;
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = (event.target?.result as string) || "";
      };
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Failed to get 2D context"));

        let width = img.width;
        let height = img.height;

        while ((width * height * 4) / (1024 * 1024) > maxSizeMB) {
          width /= 1.1;
          height /= 1.1;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size > maxSizeMB * 1024 * 1024) {
              this.compressImageBlob(blob, maxSizeMB, mimeType, quality).then(
                resolve,
                reject
              );
            } else if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          mimeType,
          quality
        );
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  static imageToFile = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Get origin image error: ${res.statusText}`);
      const blob = await res.blob();
      const fileName = url.includes(".svg") ? "file.svg" : "file.jpg";
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error("Error transferring image:", error);
    }
  };

  static fielToImage = async (file: File) => {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(file);
        resolve(url);
      } catch (error) {
        reject(error);
      }
    });
  };

  static fileToBase64 = async (file: any) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event?.target?.result);
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  static imageToBase64 = async (url: string) => {
    try {
      if (url.includes("base64")) return url;
      const file = await this.imageToFile(url);
      return await this.fileToBase64(file);
    } catch (error) {
      console.error("Transferring image error:", error);
    }
  };

  static pngToJpg = async (url: string) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = url;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(image, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      };
      image.onerror = reject;
    });
  };

  static pngFileToJpgFile = async (file: File) => {
    return new Promise(async (resolve, reject) => {
      try {
        const url = URL.createObjectURL(file);
        const jpg = (await this.pngToJpg(url)) as string;
        resolve(await this.imageToFile(jpg));
      } catch (error) {
        reject(error);
      }
    });
  };

  static readImageSize = async (file: File) => {
    return new Promise((resolve, reject) => {
      try {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        img.onload = () => {
          if (img.width && img.height) {
            resolve({ width: img.width, height: img.height });
          }
        };
        img.onerror = () => {
          reject("Load image error");
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  static localizeImage = async (url: string) => {
    try {
      const file = await this.imageToFile(url);
      return URL.createObjectURL(file as File);
    } catch (error) {
      console.log("File to url error: ", error);
    }
  };

  static resetSizeCanvas = async (
    originCanvas: any,
    size: { width: number; height: number }
  ) => {
    return new Promise((resolve) => {
      const originUrl = originCanvas.toDataURL("image/png");
      const originImage = new Image();
      originImage.onload = () => {
        const newCanvas = document.createElement("canvas");
        const newContext = newCanvas.getContext("2d");
        if (newContext && originImage) {
          newCanvas.width = size.width;
          newCanvas.height = size.height;
          newContext.drawImage(
            originImage,
            0,
            0,
            newCanvas.width,
            newCanvas.height
          );
          resolve(newCanvas);
        }
      };
      originImage.src = originUrl;
    });
  };

  static loadImage = async (src: string) => {
    const img = new Image();
    img.src = src;
  };

  static urlToBase64 = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  static downloadImage = async (url: string, name?: string) => {
    const base64Url = (await this.urlToBase64(url)) as string;
    const file = await this.imageToFile(url);
    const currentTime = this.getNowformatTime();
    const metaType = file?.type.split("/")[1] || url.split(".")[1];
    const resultName =
      name || `result-${currentTime}.${metaType.split("+")[0]}`;
    // const localUrl = URL.createObjectURL(file as File);
    const link = document.createElement("a");
    link.href = base64Url;
    link.download = resultName;

    link.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );

    setTimeout(() => {
      link.remove();
    }, 300);
  };

  static downloadVideo = async (url: string, name?: string) => {
    try {
      const base64Url = (await this.urlToBase64(url)) as string;
      const currentTime = this.getNowformatTime();
      const link = document.createElement("a");
      link.href = base64Url;
      link.download = name || `result-${currentTime}.mp4`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download video error:", error);
    }
  };

  static getNowformatTime = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return year + month + day + hours + minutes + seconds;
  };

  static formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hours = `0${date.getHours()}`.slice(-2);
    const minutes = `0${date.getMinutes()}`.slice(-2);
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };
}
