"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Character, PictureBook, StoryPage } from "@/types";
import { savePictureBook } from "@/lib/db";
import { generateStory } from "@/lib/story-generator";
import { generateAllImages } from "@/lib/image-generator";
import StepIndicator from "@/components/create/StepIndicator";
import CharacterForm from "@/components/create/CharacterForm";
import PlotInput from "@/components/create/PlotInput";
import GeneratingView from "@/components/create/GeneratingView";

type Step = 1 | 2 | 3;

const STEPS = ["角色", "情节", "生成"];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [plot, setPlot] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleCharactersSubmit = useCallback((chars: Character[]) => {
    setCharacters(chars);
    setStep(2);
  }, []);

  const handlePlotSubmit = useCallback(async (p: string) => {
    setPlot(p);
    setStep(3);
    setStatus("正在编织故事…");
    setError("");

    try {
      // 1. 生成故事
      setStatus("正在编织故事…");
      const story = await generateStory(characters, p);
      console.log("[Create] Story generated:", story.title, "pages:", story.pages?.length);

      if (!story.title || !story.pages || story.pages.length === 0) {
        throw new Error("故事生成结果异常，请重试");
      }

      // 规范化 pageNumber 为数字，确保类型一致
      const normalizedPages = story.pages.map((page, idx) => {
        const rawPn = typeof page.pageNumber === 'string' ? parseInt(page.pageNumber, 10) : (page.pageNumber || idx + 1);
        const pageNumber = isNaN(rawPn) ? idx + 1 : rawPn;
        return {
          pageNumber,
          storyText: page.storyText || "",
          imagePrompt: page.imagePrompt || "",
        };
      }).filter(p => p.pageNumber > 0);

      if (normalizedPages.length === 0) {
        throw new Error("故事分页数据异常，请重试");
      }

      console.log("[Create] Normalized pages:", normalizedPages.length);

      // 2. 批量生成图片
      setStatus("正在画画…");
      const imageMap = await generateAllImages(
        normalizedPages.map((page) => ({
          pageNumber: page.pageNumber,
          imagePrompt: page.imagePrompt,
        })),
        characters,
        setStatus
      );

      console.log("[Create] Images generated, map keys:", Array.from(imageMap.keys()));

      // 3. 组装绘本
      const pages: StoryPage[] = normalizedPages.map((page) => {
        const blob = imageMap.get(page.pageNumber);
        console.log(`[Create] Page ${page.pageNumber} blob:`, blob ? `size=${blob.size}, type=${blob.type}` : 'undefined');
        return {
          pageNumber: page.pageNumber,
          storyText: page.storyText,
          imageBlob: blob || new Blob(),
          prompt: page.imagePrompt,
        };
      });

      const coverImageBlob = imageMap.get(1);
      if (!coverImageBlob || coverImageBlob.size === 0) {
        console.warn("[Create] Cover image missing or empty");
      }

      const book: PictureBook = {
        id: uuidv4(),
        title: story.title,
        characters,
        pages,
        coverImageBlob: coverImageBlob || new Blob(),
        createdAt: new Date(),
      };

      // 4. 保存
      console.log("[Create] Saving book...");
      await savePictureBook(book);
      console.log("[Create] Book saved, redirecting...");

      // 5. 跳转阅读
      router.push(`/read/${book.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "生成失败，请重试";
      console.error("[Create] 生成失败:", message);
      setError(message);
      setStatus("");
    }
  }, [characters, router]);

  return (
    <div className="min-h-screen paper-texture">
      {/* 顶部导航 */}
      <header className="border-b border-cream-dark/50 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-brown transition-colors hover:text-mint"
          >
            <span>←</span>
            <span className="font-bold">返回书架</span>
          </button>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <StepIndicator currentStep={step} steps={STEPS} />

        {error && (
          <div className="mb-6 rounded-xl border-2 border-rose-soft bg-rose-soft/10 p-4 text-center">
            <p className="font-bold text-rose-soft">{error}</p>
            <button
              onClick={() => {
                setError("");
                setStep(1);
              }}
              className="mt-2 text-sm text-brown underline hover:text-mint"
            >
              重新开始
            </button>
          </div>
        )}

        {step === 1 && (
          <CharacterForm characters={characters} onChange={handleCharactersSubmit} />
        )}

        {step === 2 && (
          <PlotInput
            plot={plot}
            onChange={handlePlotSubmit}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && <GeneratingView status={status} />}
      </main>
    </div>
  );
}
