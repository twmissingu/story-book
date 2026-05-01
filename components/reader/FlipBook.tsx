"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PictureBook } from "@/types";
import BookPage from "./BookPage";
import PageControls from "./PageControls";

interface FlipBookProps {
  book: PictureBook;
}

export default function FlipBook({ book }: FlipBookProps) {
  const totalPages = book.pages.length;
  const [currentPage, setCurrentPage] = useState(totalPages > 0 ? 1 : 0);
  const [direction, setDirection] = useState<"left" | "right" | "none">("none");

  // 当 book 变化时（如打开新绘本或重新生成图片），同步重置 currentPage
  const prevBookIdRef = useRef(book.id);
  const prevTotalPagesRef = useRef(totalPages);

  useEffect(() => {
    const bookChanged = prevBookIdRef.current !== book.id;
    const pagesChanged = prevTotalPagesRef.current !== totalPages;

    if (bookChanged) {
      // 打开新绘本，重置到第 1 页
      prevBookIdRef.current = book.id;
      prevTotalPagesRef.current = totalPages;
      setCurrentPage(totalPages > 0 ? 1 : 0);
      setDirection("none");
    } else if (pagesChanged && totalPages > 0) {
      // 页数变化（如重新生成后页数不同），校正到有效范围
      prevTotalPagesRef.current = totalPages;
      setCurrentPage((prev) => {
        if (prev > totalPages) return totalPages;
        if (prev < 1) return 1;
        return prev;
      });
    }
  }, [book.id, totalPages]);

  const goToPage = useCallback(
    (page: number) => {
      if (totalPages === 0) return;
      if (page < 1 || page > totalPages) return;
      setDirection(page > currentPage ? "right" : "left");
      setCurrentPage(page);
    },
    [currentPage, totalPages]
  );

  // 使用 ref 保持最新回调，在 effect 中更新
  const goToPageRef = useRef(goToPage);
  useEffect(() => {
    goToPageRef.current = goToPage;
  }, [goToPage]);

  // 使用 ref 存储当前页码，在 effect 中更新
  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // 键盘翻页 - 只绑定一次，通过 ref 读取最新页码
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // 忽略输入框等可编辑元素的键盘事件
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToPageRef.current(currentPageRef.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPageRef.current(currentPageRef.current - 1);
      } else if (e.key === " " && !e.repeat) {
        // 只在阅读器区域内或阅读器被 hover 时才拦截空格
        const container = document.querySelector(".flip-book-container");
        if (
          container?.contains(document.activeElement) ||
          container?.matches(":hover")
        ) {
          e.preventDefault();
          goToPageRef.current(currentPageRef.current + 1);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 点击页面翻页
  function handlePageClick(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (clickX > width * 0.6) {
      goToPage(currentPage + 1);
    } else if (clickX < width * 0.4) {
      goToPage(currentPage - 1);
    }
  }

  // 空页面保护
  if (totalPages === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">📖</span>
          <p className="mt-4 text-lg text-brown-light">这本绘本没有内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 绘本主体 */}
      <div
        className="flip-book-container relative w-full"
        style={{ perspective: "1200px", aspectRatio: "16/10", maxHeight: "75vh" }}
        onClick={handlePageClick}
      >
        {book.pages.map((page) => (
          <BookPage
            key={page.pageNumber}
            page={page}
            isActive={page.pageNumber === currentPage}
            direction={page.pageNumber === currentPage ? direction : "none"}
          />
        ))}
      </div>

      {/* 页码和翻页控制 */}
      <PageControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => goToPage(currentPage - 1)}
        onNext={() => goToPage(currentPage + 1)}
        onGoToPage={goToPage}
      />

      <p className="text-sm text-brown-light">
        点击画面右侧翻页，左侧返回 · 也可以使用键盘方向键
      </p>
    </div>
  );
}
