"use client";

import { useState } from "react";

interface PlotInputProps {
  plot: string;
  onChange: (plot: string) => void;
  onBack: () => void;
}

export default function PlotInput({ plot, onChange, onBack }: PlotInputProps) {
  const [localPlot, setLocalPlot] = useState(plot);

  const isValid = localPlot.trim().length >= 10;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="font-display text-3xl text-brown">这个故事讲什么呢？</h2>
        <p className="mt-2 text-brown-light">写一个简短的情节概要，AI 会帮你扩写成完整的绘本故事</p>
      </div>

      <div className="rounded-2xl border-2 border-cream-dark bg-white p-6 shadow-sm">
        <textarea
          value={localPlot}
          onChange={(e) => setLocalPlot(e.target.value)}
          placeholder="例如：小兔子米米在森林里玩耍时，不小心把最喜欢的红色蝴蝶结弄丢了。它遇到了小松鼠和小鹿，大家一起帮它寻找，最后在一个意想不到的地方找到了蝴蝶结，还收获了珍贵的友谊。"
          rows={6}
          className="w-full resize-none rounded-xl border-2 border-cream-dark bg-cream/50 px-4 py-3 text-brown placeholder-brown-light/50 outline-none transition-all focus:border-mint focus:bg-white"
        />
        <p className="mt-2 text-right text-sm text-brown-light">
          {localPlot.length} 字
        </p>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="rounded-full border-2 border-cream-dark px-6 py-3 font-bold text-brown transition-all hover:bg-cream-dark/50"
        >
          ← 上一步
        </button>
        <button
          disabled={!isValid}
          onClick={() => onChange(localPlot)}
          className="rounded-full bg-peach px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          ✨ 开始创作
        </button>
      </div>
    </div>
  );
}
