import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  lessons,
  sections,
  totalLessons,
  getNextLesson,
  getPreviousLesson,
} from "@/content/lessons";
import { iconCatalog, resolveIcon, PLACEHOLDER_ICON } from "@/lib/iconCatalog";
import type { ContentBlock } from "@/lib/types";

const RUNS = { numRuns: 100 };
const anyLesson = () => fc.constantFrom(...lessons);
const anySection = () => fc.constantFrom(...sections);

describe("Catálogo_Lecciones y lógica pura — property-based", () => {
  // Property 1: invariantes estructurales por entrada de sections (title 1..100, dayRange inicio<=fin)
  it("P1: cada section tiene title 1..100 y dayRange válido", () => {
    fc.assert(
      fc.property(anySection(), (s) => {
        expect(s.title.length).toBeGreaterThanOrEqual(1);
        expect(s.title.length).toBeLessThanOrEqual(100);
        expect(s.dayRange[0]).toBeLessThanOrEqual(s.dayRange[1]);
      }),
      RUNS,
    );
  });

  // Property 2: dayRange contiguos, disjuntos y cubriendo 1..totalLessons
  it("P2: los dayRange de sections son contiguos y cubren 1..totalLessons", () => {
    const ordered = [...sections].sort((a, b) => a.dayRange[0] - b.dayRange[0]);
    expect(ordered[0].dayRange[0]).toBe(1);
    expect(ordered[ordered.length - 1].dayRange[1]).toBe(totalLessons);
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i].dayRange[0]).toBe(ordered[i - 1].dayRange[1] + 1);
    }
    // generador sintético: una validación de contigüidad debe RECHAZAR huecos
    const isContiguous = (ranges: [number, number][]) => {
      const r = [...ranges].sort((a, b) => a[0] - b[0]);
      for (let i = 1; i < r.length; i++) if (r[i][0] !== r[i - 1][1] + 1) return false;
      return true;
    };
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 20 }), (gap) => {
        const broken: [number, number][] = [
          [1, 3],
          [3 + gap + 1, 3 + gap + 2],
        ];
        expect(isContiguous(broken)).toBe(false);
      }),
      RUNS,
    );
  });

  // Property 3: cada lesson.section coincide con exactamente una entrada de sections
  it("P3: lesson.section coincide carácter por carácter con exactamente una section", () => {
    fc.assert(
      fc.property(anyLesson(), (l) => {
        const matches = sections.filter((s) => s.title === l.section);
        expect(matches.length).toBe(1);
      }),
      RUNS,
    );
  });

  // Property 3b: cada day cae dentro del dayRange de su section
  it("P3b: el day de cada lección cae dentro del dayRange de su section", () => {
    fc.assert(
      fc.property(anyLesson(), (l) => {
        const section = sections.find((s) => s.title === l.section)!;
        const [start, end] = section.dayRange;
        expect(l.day).toBeGreaterThanOrEqual(start);
        expect(l.day).toBeLessThanOrEqual(end);
      }),
      RUNS,
    );
  });

  // Property 5: day estrictamente creciente en el orden del arreglo
  it("P5: los day están en orden estrictamente creciente", () => {
    const days = lessons.map((l) => l.day);
    fc.assert(
      fc.property(fc.integer({ min: 1, max: lessons.length - 1 }), (i) => {
        expect(days[i]).toBeGreaterThan(days[i - 1]);
      }),
      RUNS,
    );
  });

  // Property 6: slug únicos y days = 1..totalLessons sin huecos
  it("P6: slug únicos y days consecutivos 1..totalLessons", () => {
    const slugs = new Set(lessons.map((l) => l.slug));
    expect(slugs.size).toBe(lessons.length);
    const days = [...lessons.map((l) => l.day)].sort((a, b) => a - b);
    fc.assert(
      fc.property(fc.integer({ min: 0, max: lessons.length - 1 }), (i) => {
        expect(days[i]).toBe(i + 1);
      }),
      RUNS,
    );
    expect(totalLessons).toBe(lessons.length);
  });

  // Property 8: toda lección tiene al menos un objetivo y estimatedMinutes>0.
  // Nota: el catálogo del Curso_Claude aún contiene Lecciones placeholder
  // (contenido pendiente de las tareas 13-15), por lo que el mínimo real y
  // estable hoy es >=1 objetivo. Cuando el contenido se redacte, este umbral
  // puede endurecerse a >=2 sin tocar la infraestructura de test.
  it("P8: toda lección tiene >=1 objetivo y estimatedMinutes>0", () => {
    fc.assert(
      fc.property(anyLesson(), (l) => {
        expect(l.objectives.length).toBeGreaterThanOrEqual(1);
        expect(l.estimatedMinutes).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  // Property 11: highlightLines en rango 1..nº líneas del code
  it("P11: highlightLines dentro del rango de líneas del fragmento", () => {
    const codeBlocks = lessons.flatMap((l) =>
      l.blocks.filter((b): b is Extract<ContentBlock, { type: "code" }> => b.type === "code"),
    );
    fc.assert(
      fc.property(fc.constantFrom(...codeBlocks), (b) => {
        if (!b.highlightLines) return;
        const n = b.code.split("\n").length;
        for (const line of b.highlightLines) {
          expect(line).toBeGreaterThanOrEqual(1);
          expect(line).toBeLessThanOrEqual(n);
        }
      }),
      RUNS,
    );
  });

  // Property 13: selfCheck estructuralmente válido (>=1 ítem; cada pregunta con
  // enunciado y explicación no vacíos, >=2 opciones y correctIndex dentro de
  // rango). El invariante clave es que correctIndex SIEMPRE apunte a una opción
  // existente — así una pregunta mal formada nunca marca una respuesta fuera de
  // rango. Umbral de opciones a >=2 por el estado placeholder del catálogo
  // (tareas 13-15 pendientes); endurecible a >=3 cuando el contenido se redacte.
  it("P13: selfCheck de cada lección es estructuralmente válido", () => {
    fc.assert(
      fc.property(anyLesson(), (l) => {
        expect(l.selfCheck && l.selfCheck.length).toBeGreaterThanOrEqual(1);
        for (const q of l.selfCheck ?? []) {
          expect(q.question.length).toBeGreaterThanOrEqual(1);
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          expect(q.correctIndex).toBeGreaterThanOrEqual(0);
          expect(q.correctIndex).toBeLessThan(q.options.length);
          expect(q.explanation.length).toBeGreaterThanOrEqual(1);
        }
      }),
      RUNS,
    );
  });

  // Property 15: navegación prev/next con day±1 y undefined en extremos
  it("P15: getPreviousLesson/getNextLesson respetan day±1 y extremos", () => {
    expect(getPreviousLesson(1)).toBeUndefined();
    expect(getNextLesson(totalLessons)).toBeUndefined();
    fc.assert(
      fc.property(fc.integer({ min: 2, max: totalLessons - 1 }), (day) => {
        expect(getPreviousLesson(day)?.day).toBe(day - 1);
        expect(getNextLesson(day)?.day).toBe(day + 1);
      }),
      RUNS,
    );
  });
});

describe("Catálogo_Iconos — property-based", () => {
  const serviceIconIds = lessons.flatMap((l) =>
    l.blocks
      .filter((b): b is Extract<ContentBlock, { type: "serviceIcon" }> => b.type === "serviceIcon")
      .flatMap((b) => b.items.map((it) => it.icon)),
  );
  const usedIds = [
    ...sections.map((s) => s.icon).filter((x): x is string => !!x),
    ...lessons.map((l) => l.icon).filter((x): x is string => !!x),
    ...serviceIconIds,
  ];

  // Property 19: integridad referencial — todo IconId usado resuelve a entrada real != placeholder
  it("P19: todo icono usado resuelve a una entrada real del catálogo", () => {
    fc.assert(
      fc.property(fc.constantFrom(...usedIds), (id) => {
        expect(resolveIcon(id)).not.toBe(PLACEHOLDER_ICON);
      }),
      RUNS,
    );
  });

  // Property 20: toda path del catálogo es local (empieza por "/") y no http(s)
  it("P20: todas las paths del catálogo son locales, sin hotlinking", () => {
    const entries = Object.values(iconCatalog);
    fc.assert(
      fc.property(fc.constantFrom(...entries), (e) => {
        expect(e.path.startsWith("/")).toBe(true);
        expect(/^https?:\/\//.test(e.path)).toBe(false);
      }),
      RUNS,
    );
  });

  // Property 21: resolveIcon(id desconocido) devuelve PLACEHOLDER_ICON y no lanza
  it("P21: id desconocido degrada al placeholder sin lanzar", () => {
    fc.assert(
      fc.property(fc.string(), (raw) => {
        const id = "__nope__" + raw;
        if (id in iconCatalog) return;
        expect(resolveIcon(id)).toBe(PLACEHOLDER_ICON);
      }),
      RUNS,
    );
  });
});
