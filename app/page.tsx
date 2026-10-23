import Link from "next/link";

// Constante local de bienvenida. El catálogo real de lecciones
// (@/content/lessons) se registra en tareas posteriores; aquí se usa un
// valor local para mantener el proyecto instalable sin ese import.
const totalLessons = 27;

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
        Curso de autoestudio — {totalLessons} lecciones
      </span>
      <h1 className="max-w-2xl text-4xl font-bold text-slate-900 sm:text-5xl dark:text-slate-50">
        Claude Developer Platform: de los fundamentos a temas avanzados
      </h1>
      <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
        Una ruta de aprendizaje en tres niveles (Básico, Medio y Avanzado) sobre
        la Claude Developer Platform. Avanzá a tu ritmo, tu progreso se guarda
        automáticamente en este dispositivo.
      </p>
      <Link
        href="/curso"
        className="mt-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-600"
      >
        Empezar el curso
      </Link>
    </main>
  );
}
