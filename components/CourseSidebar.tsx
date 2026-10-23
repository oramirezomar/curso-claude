"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { lessons, sections } from "@/content/lessons";
import { useProgress } from "@/lib/useProgress";
import ConceptIcon from "./ConceptIcon";

export default function CourseSidebar() {
  const pathname = usePathname();
  const { isCompleted, hydrated, progressPercent } = useProgress();
  const [open, setOpen] = useState(false);

  const currentSlug = pathname?.split("/").pop();

  const content = (
    <nav className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Progreso
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${hydrated ? progressPercent : 0}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {hydrated ? `${progressPercent}% completado` : "Cargando..."}
        </p>
      </div>

      {sections.map((section) => {
        const sectionLessons = lessons.filter(
          (l) => l.day >= section.dayRange[0] && l.day <= section.dayRange[1],
        );
        return (
          <div key={section.title}>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <ConceptIcon id={section.icon ?? ""} label={section.title} size={18} />
              {section.title}
            </p>
            <ul className="flex flex-col gap-1">
              {sectionLessons.map((lesson) => {
                const active = lesson.slug === currentSlug;
                const done = isCompleted(lesson.day);
                return (
                  <li key={lesson.slug}>
                    <Link
                      href={`/curso/${lesson.slug}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                        active
                          ? "bg-brand-500 text-white"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          active
                            ? "bg-white/20"
                            : done
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {done && !active ? "✓" : lesson.day}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Botón hamburguesa: solo mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm lg:hidden dark:border-slate-700 dark:bg-slate-900"
        aria-label="Abrir índice del curso"
      >
        <span className="text-lg">☰</span>
      </button>

      {/* Sidebar fijo en desktop */}
      <aside className="hidden w-72 flex-shrink-0 border-r border-slate-200 lg:block dark:border-slate-800">
        {content}
      </aside>

      {/* Drawer en mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl dark:bg-slate-900">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Cerrar índice"
              >
                ✕
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
