import { notFound } from "next/navigation";
import { getLessonBySlug, getNextLesson, getPreviousLesson, lessons } from "@/content/lessons";
import ContentRenderer from "@/components/ContentRenderer";
import SelfCheck from "@/components/SelfCheck";
import LessonFooter from "@/components/LessonFooter";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);

  if (!lesson) {
    notFound();
  }

  const prev = getPreviousLesson(lesson.day);
  const next = getNextLesson(lesson.day);

  return (
    <article>
      <p className="text-sm font-medium uppercase tracking-wide text-brand-500">
        Día {lesson.day} · {lesson.section}
      </p>
      <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">{lesson.title}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        ⏱ {lesson.estimatedMinutes} minutos estimados
      </p>

      {lesson.objectives.length > 0 && (
        <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Objetivos de esta lección
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
            {lesson.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <ContentRenderer blocks={lesson.blocks} />
      </div>

      <SelfCheck questions={lesson.selfCheck} />

      <LessonFooter day={lesson.day} prevSlug={prev?.slug} nextSlug={next?.slug} />
    </article>
  );
}
