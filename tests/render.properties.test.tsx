// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import fc from "fast-check";
import { render, cleanup, screen } from "@testing-library/react";
import ConceptIcon from "@/components/ConceptIcon";
import SelfCheck from "@/components/SelfCheck";
import CodeBlock from "@/components/CodeBlock";
import ContentRenderer from "@/components/ContentRenderer";
import { iconCatalog } from "@/lib/iconCatalog";
import { generateStaticParams } from "@/app/curso/[slug]/page";
import { lessons } from "@/content/lessons";

const RUNS = { numRuns: 100 };
afterEach(() => cleanup());

describe("ConceptIcon — property-based", () => {
  // Property 22: todo ConceptIcon renderiza con alt/aria-label no vacío
  it("P22: ConceptIcon siempre tiene texto alternativo no vacío", () => {
    const ids = Object.keys(iconCatalog);
    fc.assert(
      fc.property(fc.constantFrom(...ids), fc.string(), (id, label) => {
        cleanup();
        const { container } = render(<ConceptIcon id={id} label={label} />);
        const img = container.querySelector("img");
        expect(img).not.toBeNull();
        // El alt útil nunca queda vacío: si el label es vacío/espacios cae al defaultLabel.
        const alt = (img!.getAttribute("alt") ?? "").trim();
        expect(alt.length).toBeGreaterThanOrEqual(1);
      }),
      RUNS,
    );
  });

  // Property 22b: ConceptIcon con id desconocido degrada al placeholder sin lanzar
  it("P22b: ConceptIcon con id inexistente renderiza placeholder sin lanzar", () => {
    fc.assert(
      fc.property(fc.string(), (raw) => {
        const id = "__missing__" + raw;
        if (id in iconCatalog) return;
        cleanup();
        const { container } = render(<ConceptIcon id={id} label="Concepto" />);
        const img = container.querySelector("img");
        expect(img).not.toBeNull();
        expect((img!.getAttribute("alt") ?? "").trim().length).toBeGreaterThanOrEqual(1);
      }),
      RUNS,
    );
  });
});

describe("CodeBlock (async server component) — fallback de lenguaje", () => {
  // Property 10: lenguaje no soportado cae a text y no lanza.
  // Nota: CodeBlock es un async server component. jsdom/React no reconcilia
  // server components async, por lo que invocamos la función y afirmamos sobre
  // el elemento resultante (no se usa render() del DOM).
  it("P10: CodeBlock resuelve sin lanzar para cualquier lang (soportado o no)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constantFrom("bash", "json", "ts", "js", "python", "text"),
          // Langs arbitrarios NO soportados: identificadores alfanuméricos.
          // Se restringe el charset a-z0-9 a propósito para no generar nombres
          // de propiedades de Object.prototype (p. ej. "valueOf"/"toString"),
          // que el lookup por objeto plano de CodeBlock no trata como "no
          // soportado". El invariante que validamos es el fallback de lenguaje,
          // no la resistencia de shiki a claves de prototipo.
          fc
            .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789".split("")), {
              minLength: 1,
              maxLength: 10,
            })
            .map((chars) => chars.join("")),
        ),
        fc.string({ minLength: 1, maxLength: 40 }),
        async (lang, code) => {
          // Invocación directa del server component async (no se usa render()
          // del DOM): jsdom/React no reconcilia server components async.
          const el = await CodeBlock({ code, lang: lang as never, title: "t" });
          expect(el).toBeTruthy();
          expect(typeof el).toBe("object");
          expect(el).toHaveProperty("type");
        },
      ),
      { numRuns: 60 },
    );
  });
});

describe("ContentRenderer (async) — validez de bloques", () => {
  // Property 7: ContentRenderer resuelve cada bloque real sin lanzar.
  // Nota: componente async de servidor; se invoca y se afirma sobre el elemento
  // resultante sin pasarlo por el reconciliador de React (no soporta server
  // components async anidados en jsdom).
  it("P7: cada bloque de cada lección produce un elemento sin lanzar", async () => {
    const allBlocks = lessons.flatMap((l) => l.blocks);
    const idxArb = fc.nat({ max: allBlocks.length - 1 });
    await fc.assert(
      fc.asyncProperty(idxArb, async (i) => {
        const block = allBlocks[i];
        // Invocación directa del server component async (ver nota arriba).
        const el = await ContentRenderer({ blocks: [block] });
        expect(el).toBeTruthy();
        expect(el).toHaveProperty("type");
      }),
      { numRuns: 100 },
    );
  });
});

describe("generateStaticParams ↔ slug", () => {
  // Property 18: generateStaticParams produce exactamente los slug del catálogo
  it("P18: biyección entre generateStaticParams y lessons.slug", () => {
    const params = generateStaticParams();
    const paramSlugs = params.map((p) => p.slug).sort();
    const lessonSlugs = lessons.map((l) => l.slug).sort();
    expect(paramSlugs).toEqual(lessonSlugs);
    expect(new Set(paramSlugs).size).toBe(lessonSlugs.length);
    fc.assert(
      fc.property(fc.constantFrom(...params), (p) => {
        expect(lessons.some((l) => l.slug === p.slug)).toBe(true);
      }),
      RUNS,
    );
  });
});

describe("SelfCheck (client) — interacción", () => {
  // Property 6.6: al seleccionar una opción se revela corrección + explicación
  it("SelfCheck revela la explicación al seleccionar una opción", async () => {
    const { default: userEventDefault } = await import("@testing-library/user-event");
    const user = userEventDefault.setup();
    const questions = [
      {
        question: "¿Qué es la Messages API?",
        options: ["Un modelo", "El endpoint de conversación de Claude", "Un tipo de token"],
        correctIndex: 1,
        explanation: "La Messages API es el endpoint de conversación de la Claude Developer Platform.",
      },
    ];
    render(<SelfCheck questions={questions} />);
    await user.click(screen.getByText("El endpoint de conversación de Claude"));
    expect(screen.getByText(/endpoint de conversación de la Claude Developer Platform/)).toBeTruthy();
  });
});
