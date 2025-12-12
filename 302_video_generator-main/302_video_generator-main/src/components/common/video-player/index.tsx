"use client";

import React, { useEffect, useState } from "react";

import ReactPlayer from "react-player";

interface VideoPlayerProps {
  url: string;
  width?: string;
  height?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  width = "100%",
  height = "100%",
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Force re-render when URL changes
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [url]);

  const handleError = () => {
    // Simple retry by forcing component re-render
    setTimeout(() => {
      setKey((prev) => prev + 1);
    }, 1000);
  };

  if (!isMounted) return null;
  return (
    <ReactPlayer
      key={key}
      url={url}
      width={width}
      height={height}
      controls={true}
      onError={handleError}
      config={{
        youtube: {
          playerVars: { showinfo: 1 },
        },
        file: {
          attributes: {
            crossOrigin: "anonymous",
          },
        },
      }}
    />
  );
};

export default VideoPlayer;
