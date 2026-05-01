"use client";

import { PictureBook } from "@/types";
import { useState, useEffect } from "react";

interface BookCardProps {
  book: PictureBook;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function BookCard({ book, onClick, onDelete }: BookCardProps) {
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    const url = URL.createObjectURL(book.coverImageBlob);
    setCoverUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [book.coverImageBlob]);

  const formattedDate = new Date(book.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className="book-card group relative cursor-pointer rounded-2xl bg-white p-3 shadow-lg hover:shadow-2xl"
    >
      {/* 书籍封面 */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream-dark">
        {!hasError && coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl">📖</span>
          </div>
        )}
        {/* 删除按钮 */}
        <button
          onClick={onDelete}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-brown opacity-0 shadow-sm transition-opacity hover:bg-rose-soft hover:text-white group-hover:opacity-100"
          title="删除绘本"
        >
          ✕
        </button>
      </div>

      {/* 书籍信息 */}
      <div className="mt-3 px-1">
        <h3 className="truncate text-lg font-bold text-brown">{book.title}</h3>
        <p className="mt-1 text-sm text-brown-light">{formattedDate}</p>
      </div>
    </div>
  );
}
