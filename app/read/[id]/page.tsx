"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PictureBook, StoryPage } from "@/types";
import { getPictureBook, savePictureBook } from "@/lib/db";
import { generateAllImages } from "@/lib/image-generator";
import FlipBook from "@/components/reader/FlipBook";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim() || "未命名绘本";
}

function getImageExt(blobType: string): string {
  if (blobType.includes("png")) return "png";
  if (blobType.includes("svg")) return "svg";
  if (blobType.includes("webp")) return "webp";
  if (blobType.includes("gif")) return "gif";
  return "jpg";
}

export default function ReadPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [book, setBook] = useState<PictureBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenStatus, setRegenStatus] = useState("");

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadBook() {
      try {
        const b = await getPictureBook(id);
        if (isMounted) setBook(b);
      } catch (err) {
        console.error("加载绘本失败:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBook();
    return () => { isMounted = false; };
  }, [id]);

  function hasPlaceholderImages(b: PictureBook): boolean {
    return b.pages.some(
      (p) => p.imageBlob.type === "image/svg+xml"
    );
  }

  async function handleRegenerateImages() {
    if (!book) return;
    if (!confirm("确定要重新生成所有插画吗？这会覆盖现有的图片。")) return;

    setRegenerating(true);
    setRegenStatus("正在重新画画…");

    try {
      const imageMap = await generateAllImages(
        book.pages.map((page) => ({
          pageNumber: page.pageNumber,
          imagePrompt: page.prompt,
        })),
        book.characters,
        setRegenStatus
      );

      const newPages: StoryPage[] = book.pages.map((page) => ({
        ...page,
        imageBlob: imageMap.get(page.pageNumber) || page.imageBlob,
      }));

      const coverImageBlob = imageMap.get(1) || book.coverImageBlob;

      const updatedBook: PictureBook = {
        ...book,
        pages: newPages,
        coverImageBlob,
      };

      await savePictureBook(updatedBook);
      setBook(updatedBook);
      setRegenStatus("✅ 图片已更新！");
      setTimeout(() => setRegenStatus(""), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "重新生成失败";
      console.error("重新生成图片失败:", message);
      setRegenStatus(`❌ ${message}`);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleExport() {
    if (!book) return;
    setExporting(true);
    try {
      const zip = new JSZip();

      // 添加故事文本
      const storyText = [
        `《${book.title}》`,
        "",
        `创作时间：${book.createdAt.toLocaleDateString("zh-CN")}`,
        `角色：${book.characters.map((c) => c.name).join("、")}`,
        "",
        "---",
        "",
        ...book.pages.map(
          (p) => `第 ${p.pageNumber} 页\n\n${p.storyText}\n\n---\n`
        ),
      ].join("\n");
      zip.file("story.txt", storyText);

      // 添加图片
      const imagesFolder = zip.folder("images");
      for (const page of book.pages) {
        if (!page.imageBlob || page.imageBlob.size === 0) continue;
        const ext = getImageExt(page.imageBlob.type);
        imagesFolder?.file(
          `page-${String(page.pageNumber).padStart(2, "0")}.${ext}`,
          page.imageBlob
        );
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${sanitizeFileName(book.title)}-绘本.zip`);
    } catch (err) {
      console.error("导出失败:", err);
      alert("导出失败，请重试");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl animate-twinkle">📖 加载中…</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <span className="text-6xl">😢</span>
        <p className="text-xl text-brown">找不到这本绘本</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-full bg-mint px-6 py-2 font-bold text-white"
        >
          返回书架
        </button>
      </div>
    );
  }

  const showRegenButton = hasPlaceholderImages(book);

  return (
    <div className="min-h-screen paper-texture">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 border-b border-cream-dark/50 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1 text-brown transition-colors hover:text-mint"
            >
              <span>←</span>
              <span className="font-bold">书架</span>
            </button>
            <div className="h-6 w-px bg-cream-dark" />
            <h1 className="font-display text-2xl text-brown truncate max-w-xs sm:max-w-md">
              {book.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {showRegenButton && !regenerating && (
              <button
                onClick={handleRegenerateImages}
                disabled={regenerating}
                className="flex items-center gap-2 rounded-full bg-peach px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50"
              >
                <span>🎨</span>
                <span>重新画画</span>
              </button>
            )}

            {regenerating && (
              <div className="flex items-center gap-2 rounded-full bg-cream-dark px-5 py-2 text-sm font-bold text-brown">
                <span className="animate-spin">🎨</span>
                <span>{regenStatus}</span>
              </div>
            )}

            {!regenerating && regenStatus && (
              <div className="flex items-center gap-2 rounded-full bg-mint/20 px-5 py-2 text-sm font-bold text-mint">
                <span>{regenStatus}</span>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={exporting || regenerating}
              className="flex items-center gap-2 rounded-full bg-sky px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50"
            >
              <span>{exporting ? "⏳" : "📥"}</span>
              <span>{exporting ? "导出中…" : "导出绘本"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 阅读器 */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <FlipBook book={book} />
      </main>
    </div>
  );
}
