"use client";

import { useRouter } from "next/navigation";

export default function EmptyShelf() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-float mb-6 text-8xl">📚</div>
      <h2 className="mb-2 text-2xl font-bold text-brown">
        书架上还没有绘本
      </h2>
      <p className="mb-8 max-w-md text-center text-brown-light">
        快去创作第一本绘本吧！只需要描述几个可爱的角色和一个有趣的故事情节，AI 就会为你画出精美的插画。
      </p>
      <button
        onClick={() => router.push("/create")}
        className="animate-pulse-glow rounded-full bg-mint px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-mint/90 hover:shadow-xl active:scale-95"
      >
        ✨ 创作第一本绘本
      </button>
    </div>
  );
}
