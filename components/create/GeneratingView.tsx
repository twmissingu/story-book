"use client";

import { useEffect, useState } from "react";

interface GeneratingViewProps {
  status: string;
}

const STATUS_MESSAGES = [
  "正在编织故事…",
  "正在构思画面…",
  "正在画画…",
  "正在上色…",
  "快要完成了…",
];

export default function GeneratingView({ status }: GeneratingViewProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  // 当外部 status 变化时，重置轮播索引
  useEffect(() => {
    setMessageIndex(0);
  }, [status]);

  // 只有没有外部 status 时才轮播默认消息
  useEffect(() => {
    if (status) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* 旋转画笔动画 */}
      <div className="relative mb-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-mint/20">
          <span className="animate-spin text-5xl" style={{ animationDuration: '3s' }}>
            🎨
          </span>
        </div>
        {/* 光晕 */}
        <div className="absolute inset-0 rounded-full bg-mint/10 animate-ping" style={{ animationDuration: '2s' }} />
      </div>

      <h2 className="mb-2 text-2xl font-bold text-brown">
        {status || STATUS_MESSAGES[messageIndex]}
      </h2>
      <p className="text-brown-light">
        魔法正在发生，请稍等片刻…
      </p>

      {/* 装饰星星 */}
      <div className="mt-10 flex gap-4">
        <span className="animate-twinkle text-2xl" style={{ animationDelay: '0s' }}>⭐</span>
        <span className="animate-twinkle text-2xl" style={{ animationDelay: '0.5s' }}>✨</span>
        <span className="animate-twinkle text-2xl" style={{ animationDelay: '1s' }}>🌟</span>
        <span className="animate-twinkle text-2xl" style={{ animationDelay: '1.5s' }}>✨</span>
      </div>
    </div>
  );
}
