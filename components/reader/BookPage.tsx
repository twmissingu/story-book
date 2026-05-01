"use client";

import { useState, useEffect, useRef } from "react";
import { StoryPage } from "@/types";

interface BookPageProps {
  page: StoryPage;
  isActive: boolean;
  direction: "left" | "right" | "none";
}

export default function BookPage({ page, isActive, direction }: BookPageProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const urlRef = useRef<string>("");

  useEffect(() => {
    // 清理旧的 objectURL（如果存在）
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = "";
    }
    setImageUrl("");

    // 只有当前页且有有效 blob 时才加载
    if (!isActive) return;
    if (!page.imageBlob || page.imageBlob.size === 0) return;

    const url = URL.createObjectURL(page.imageBlob);
    urlRef.current = url;
    setImageUrl(url);

    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = "";
      }
    };
  }, [isActive, page.imageBlob]);

  const animationClass =
    direction === "left"
      ? "animate-slide-in-left"
      : direction === "right"
      ? "animate-slide-in-right"
      : "";

  return (
    <div
      className={`absolute inset-0 flex rounded-2xl bg-white shadow-2xl overflow-hidden transition-all duration-500 ${
        isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 z-0 pointer-events-none"
      } ${animationClass}`}
    >
      {/* 左侧插画 */}
      <div className="w-[55%] bg-cream/30 flex items-center justify-center p-6">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`第 ${page.pageNumber} 页插画`}
            className="max-h-full max-w-full min-h-[200px] min-w-[200px] rounded-xl object-contain shadow-md"
            onError={(e) => {
              console.error(`[BookPage] Image load error for page ${page.pageNumber}`);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl animate-twinkle">🎨</span>
          </div>
        )}
      </div>

      {/* 右侧文字 */}
      <div className="w-[45%] flex flex-col justify-center p-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint/20 text-sm font-bold text-mint">
            {page.pageNumber}
          </span>
          <div className="h-px flex-1 bg-cream-dark/50" />
        </div>
        <p className="leading-loose text-lg text-brown whitespace-pre-wrap">
          {page.storyText}
        </p>
      </div>
    </div>
  );
}
