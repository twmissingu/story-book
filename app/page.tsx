"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PictureBook } from "@/types";
import { getAllPictureBooks, deletePictureBook } from "@/lib/db";
import BookCard from "@/components/bookshelf/BookCard";
import EmptyShelf from "@/components/bookshelf/EmptyShelf";

export default function HomePage() {
  const router = useRouter();
  const [books, setBooks] = useState<PictureBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBooks() {
      try {
        const all = await getAllPictureBooks();
        // 按创建时间倒序
        all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (isMounted) setBooks(all);
      } catch (err) {
        console.error("加载绘本失败:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBooks();
    return () => { isMounted = false; };
  }, []);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("确定要删除这本绘本吗？")) return;
    try {
      await deletePictureBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("删除失败:", err);
      alert("删除失败，请重试");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl animate-twinkle">📖 加载中…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-texture">
      {/* 顶部标题栏 */}
      <header className="sticky top-0 z-10 border-b border-cream-dark/50 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏠</span>
            <h1 className="font-display text-3xl text-brown">小小绘本屋</h1>
          </div>
          <button
            onClick={() => router.push("/create")}
            className="flex items-center gap-2 rounded-full bg-peach px-5 py-2.5 font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <span>✨</span>
            <span>创作新绘本</span>
          </button>
        </div>
      </header>

      {/* 书架内容 */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {books.length === 0 ? (
          <EmptyShelf />
        ) : (
          <>
            <div className="mb-8 flex items-center gap-2">
              <span className="text-xl">📚</span>
              <h2 className="text-xl font-bold text-brown">
                我的绘本书架（{books.length} 本）
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => router.push(`/read/${book.id}`)}
                  onDelete={(e) => handleDelete(e, book.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* 底部装饰 */}
      <footer className="mt-auto py-8 text-center text-sm text-brown-light">
        <p>✨ 每一本绘本都是独一无二的魔法 ✨</p>
      </footer>
    </div>
  );
}
