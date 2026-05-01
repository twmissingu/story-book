"use client";

interface PageControlsProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage?: (page: number) => void;
}

export default function PageControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoToPage,
}: PageControlsProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={onPrev}
        disabled={currentPage <= 1}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md text-xl transition-all hover:scale-110 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        ←
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          const isActive = pageNum === currentPage;
          return (
            <button
              key={`page-dot-${pageNum}`}
              onClick={() => {
                if (pageNum === currentPage) return;
                if (onGoToPage) {
                  onGoToPage(pageNum);
                } else if (pageNum < currentPage) {
                  onPrev();
                } else {
                  onNext();
                }
              }}
              className={`h-2.5 rounded-full transition-all ${
                isActive
                  ? "w-8 bg-mint"
                  : "w-2.5 bg-cream-dark hover:bg-peach"
              }`}
            />
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md text-xl transition-all hover:scale-110 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        →
      </button>
    </div>
  );
}
