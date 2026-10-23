// Página_Índice del Curso_Claude (Claude Developer Platform).
//
// Clonada del patrón del Curso_AWS (curso-aws/app/curso/page.tsx) y adaptada
// al temario Claude con iconografía neutra: junto al título de cada Nivel
// (`section.title`) se renderiza su icono mediante <ConceptIcon> resuelto
// desde el Catálogo_Iconos (Req 11.1).
//
// Agrupa las Lecciones por `sections` usando el MISMO patrón de filtrado por
// `dayRange` que la Barra_Lateral (Req 7.2). No aplica gating secuencial: cada
// Lección enlaza directamente a su ruta (Req 1.5).
//
// Mientras `lessons` esté vacío (las Lecciones se crean en tareas posteriores),
// cada Nivel se renderiza igualmente con su título e icono, sin lista de
// Lecciones, y la página compila sin romper (`tsc --noEmit`).

import Link from "next/link";
import { lessons, sections } from "@/content/lessons";
import ConceptIcon from "@/components/ConceptIcon";

export default function CourseIndexPage() {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">Índice del curso</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        27 días organizados por niveles. Podés saltar de día si querés — no hay
        bloqueo secuencial.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {sections.map((section) => {
          const sectionLessons = lessons.filter(
            (l) => l.day >= section.dayRange[0] && l.day <= section.dayRange[1],
          );
          return (
            <div key={section.title}>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-brand-600 dark:text-brand-300">
                <ConceptIcon id={section.icon ?? ""} label={section.title} />
                {section.title}
              </h2>
              <div className="flex flex-col gap-2">
                {sectionLessons.map((lesson) => (
                  <Link
                    key={lesson.slug}
                    href={`/curso/${lesson.slug}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:border-brand-400 hover:bg-brand-50 dark:border-slate-800 dark:hover:bg-brand-900/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {lesson.day}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {lesson.title}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {lesson.estimatedMinutes} min
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
