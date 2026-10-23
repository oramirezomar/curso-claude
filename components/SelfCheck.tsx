"use client";

import { useState } from "react";
import type { Lesson } from "@/lib/types";

export default function SelfCheck({ questions }: { questions: Lesson["selfCheck"] }) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  if (!questions || questions.length === 0) return null;

  function selectOption(questionIdx: number, optionIdx: number) {
    if (revealed[questionIdx]) return;
    setSelected((prev) => ({ ...prev, [questionIdx]: optionIdx }));
    setRevealed((prev) => ({ ...prev, [questionIdx]: true }));
  }

  return (
    <div className="mt-8 flex flex-col gap-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Autoevaluación rápida</h3>
      {questions.map((q, qIdx) => {
        const userAnswer = selected[qIdx];
        const isRevealed = revealed[qIdx];
        const isCorrect = userAnswer === q.correctIndex;

        return (
          <div key={qIdx} className="flex flex-col gap-3">
            <p className="font-medium text-slate-800 dark:text-slate-200">
              {qIdx + 1}. {q.question}
            </p>
            <div className="flex flex-col gap-2">
              {q.options.map((option, oIdx) => {
                let style = "border-slate-300 dark:border-slate-600";
                if (isRevealed) {
                  if (oIdx === q.correctIndex) {
                    style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30";
                  } else if (oIdx === userAnswer) {
                    style = "border-red-400 bg-red-50 dark:bg-red-900/30";
                  }
                }
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => selectOption(qIdx, oIdx)}
                    disabled={isRevealed}
                    className={`rounded-lg border px-4 py-2 text-left text-sm transition disabled:cursor-default ${style} ${
                      !isRevealed ? "hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20" : ""
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {isRevealed && (
              <p
                className={`rounded-md p-3 text-sm ${
                  isCorrect
                    ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"
                    : "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100"
                }`}
              >
                {isCorrect ? "✅ Correcto. " : "❌ No es esa. "}
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
