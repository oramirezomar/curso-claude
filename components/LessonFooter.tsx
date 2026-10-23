"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useProgress } from "@/lib/useProgress";

interface LessonFooterProps {
  day: number;
  prevSlug?: string;
  nextSlug?: string;
}

export default function LessonFooter({ day, prevSlug, nextSlug }: LessonFooterProps) {
  const { isCompleted, toggleComplete, markVisited } = useProgress();

  useEffect(() => {
    markVisited(day);
  }, [day, markVisited]);

  const done = isCompleted(day);

  return (
    <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
      <button
        type="button"
        onClick={() => toggleComplete(day)}
        className={`self-start rounded-lg px-4 py-2 text-sm font-medium transition ${
          done
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "border border-brand-400 text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/20"
        }`}
      >
        {done ? "✓ Día completado" : "Marcar día como completado"}
      </button>

      <div className="flex items-center justify-between gap-4">
        {prevSlug ? (
          <Link
            href={`/curso/${prevSlug}`}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300"
          >
            ← Día anterior
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {nextSlug ? (
          <Link
            href={`/curso/${nextSlug}`}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Siguiente día →
          </Link>
        ) : (
          <Link
            href="/curso"
            className="flex-1 rounded-lg bg-brand-500 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Volver al índice
          </Link>
        )}
      </div>
    </div>
  );
}
