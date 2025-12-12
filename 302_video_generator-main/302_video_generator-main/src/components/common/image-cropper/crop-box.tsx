/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

import { Cropper } from "react-mobile-cropper";
import "react-mobile-cropper/dist/style.css";

import { CircleLoader } from "../loader-renderer";

interface PropsData {
  src: string;
  ratio: string;
  setCanvas: (data: any) => void;
}

const CropBox = ({ src, ratio, setCanvas }: PropsData) => {
  const [ratioValue, setRatioValue] = useState(0);
  const cropperRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [image, setImage] = React.useState<any>(null);
  const [isReady, setIsReady] = React.useState(false);

  // 处理图片加载
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      // console.log("img:::", img);
      setImage(img);
      setIsReady(false);
    };
    img.onerror = () => {
      console.error("Load image error");
    };
  }, [src]);

  // 处理裁切器初始化
  useEffect(() => {
    if (!cropperRef.current || !image || !containerRef.current) return;

    const checkCanvas = () => {
      try {
        const canvas = cropperRef.current.getCanvas();
        // console.log("canvas:::", canvas);
        if (canvas) {
          setCanvas(canvas);
          setIsReady(true);
          return true;
        }
      } catch (error) {
        console.error("Failed to get canvas:", error);
      }
      return false;
    };

    // 立即检查一次
    if (!checkCanvas()) {
      // 如果获取失败，设置观察器监听DOM变化
      const observer = new MutationObserver(() => {
        if (checkCanvas()) {
          observer.disconnect();
        }
      });

      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      return () => observer.disconnect();
    }
  }, [image, setCanvas]);

  // 处理比例变化
  useEffect(() => {
    const ratioSizes = ratio.split(":");
    setRatioValue(Number(ratioSizes[0]) / Number(ratioSizes[1]));

    // 比例变化时更新 canvas
    if (isReady && cropperRef.current) {
      setCanvas(cropperRef.current.getCanvas());
    }
  }, [ratio, isReady, setCanvas]);

  // 处理裁切变化
  const onChange = () => {
    if (isReady && cropperRef.current) {
      setCanvas(cropperRef.current.getCanvas());
    }
  };

  return (
    <CircleLoader loading={!image}>
      <div className="w-full" ref={containerRef}>
        <Cropper
          ref={cropperRef}
          className="w-full"
          src={src}
          onChange={onChange}
          stencilProps={{
            aspectRatio: ratioValue || {
              minimum: 1 / 16,
              maximum: 16 / 1,
            },
            movable: false,
            resizable: true,
          }}
        />
      </div>
    </CircleLoader>
  );
};

export default CropBox;
