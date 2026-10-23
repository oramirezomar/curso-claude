import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 14.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-tools-detail.md (§9 Gestión de Contexto:
// compaction y context editing). Terminología oficial. Req 3.11.
export const day16: Lesson = {
  day: 16,
  slug: "gestion-de-contexto",
  title: "Gestión de contexto",
  section: "MEDIO",
  estimatedMinutes: 26,
  icon: "concept-contexto",
  objectives: [
    "Usar compaction para resumir automáticamente el contexto antiguo al acercarse al límite de la ventana",
    "Aplicar context editing para limpiar selectivamente contenido irrelevante del historial",
    "Decidir entre compaction del lado servidor (preferible) y context editing (control fino)",
    "Reconocer que ambos están en beta y requieren su cabecera beta correspondiente",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "A medida que una conversación o un flujo agéntico crece, dos cosas empeoran: te acercas al límite de la ventana de contexto y la calidad de respuesta se degrada, porque el contenido irrelevante distrae al modelo. La plataforma ofrece dos mecanismos complementarios para gestionar ese contexto, ambos en beta.",
    },
    { type: "heading", level: 2, text: "Compaction" },
    {
      type: "callout",
      variant: "warning",
      text:
        "Compaction está en BETA. Se activa con la cabecera anthropic-beta compact-2026-01-12. Disponible en las cinco plataformas, todas en beta. Soportada en Fable 5.1, Opus 5, Sonnet 5 y varios más.",
    },
    {
      type: "paragraph",
      text:
        "Compaction resume automáticamente el contexto antiguo cuando se acerca al límite de la ventana. Hace dos cosas a la vez: extiende la longitud efectiva de contexto y mantiene el contexto activo pequeño. Es la estrategia recomendada para conversaciones de larga duración y flujos agénticos, porque gestiona el contexto automáticamente, sin código de resumen del lado cliente.",
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Gestión de contexto", icon: "concept-contexto" },
        { service: "Caché de prompts", icon: "concept-cache" },
        { service: "Tool use", icon: "concept-herramientas" },
      ],
    },
    {
      type: "code",
      lang: "bash",
      title: "Activar compaction con su cabecera beta",
      code:
        "curl https://api.anthropic.com/v1/messages \\\n" +
        "  -H \"Authorization: Bearer $ANTHROPIC_API_KEY\" \\\n" +
        "  -H \"anthropic-version: 2023-06-01\" \\\n" +
        "  -H \"anthropic-beta: compact-2026-01-12\" \\\n" +
        "  -H \"content-type: application/json\" \\\n" +
        "  -d '{ \"model\": \"claude-opus-5\", \"max_tokens\": 4096, \"messages\": [ ... ] }'",
      highlightLines: [4],
    },
    { type: "heading", level: 2, text: "Context editing" },
    {
      type: "paragraph",
      text:
        "Context editing permite limpiar selectivamente contenido concreto del historial a medida que crece. Su encuadre va más allá del coste: se trata de curar activamente lo que Claude ve. El contexto es un recurso finito con retornos decrecientes, y el contenido irrelevante degrada el foco del modelo.",
    },
    {
      type: "list",
      items: [
        "Limpieza de resultados de herramienta: para flujos agénticos intensivos donde los resultados antiguos ya no hacen falta.",
        "Limpieza de bloques de razonamiento: gestionar thinking extendido, con opción de preservar el razonamiento reciente para continuidad.",
        "Compaction del lado cliente (SDK): alternativa por resumen; la compaction del lado servidor es generalmente preferible.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "La propia documentación posiciona context editing como herramienta de control fino para escenarios específicos, no como estrategia principal. Para la mayoría de casos, compaction del lado servidor. Y context editing tiene una sección sobre su uso combinado con la herramienta de memoria.",
    },
    { type: "heading", level: 2, text: "Cuál elegir" },
    {
      type: "comparison",
      lang: "ts",
      before: {
        title: "Compaction (lado servidor) — por defecto",
        code:
          "// Resume el contexto antiguo automáticamente\n" +
          "// al acercarse al límite. Sin código de\n" +
          "// resumen propio. Recomendado para\n" +
          "// conversaciones largas y flujos agénticos.\n" +
          "// Cabecera: compact-2026-01-12",
      },
      after: {
        title: "Context editing — control fino",
        code:
          "// Limpias selectivamente: resultados de\n" +
          "// herramienta antiguos, bloques de thinking.\n" +
          "// Para escenarios específicos donde quieres\n" +
          "// decidir qué se queda y qué se va.\n" +
          "// No es la estrategia principal.",
      },
    },
    {
      type: "checklist",
      title: "Checklist de gestión de contexto",
      items: [
        "Para conversaciones largas, parto de compaction del lado servidor.",
        "Envío la cabecera beta correcta (compact-2026-01-12) y asumo que es beta.",
        "Uso context editing solo para control fino de contenido concreto.",
        "Tengo en cuenta la interacción de ambos con la caché de prompts.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Qué hace compaction y por qué es la estrategia recomendada para conversaciones largas?",
      options: [
        "Borra toda la conversación al llegar al límite",
        "Resume automáticamente el contexto antiguo al acercarse al límite: extiende la longitud efectiva y mantiene el contexto activo pequeño, sin código de resumen del lado cliente",
        "Aumenta la ventana de contexto a 10M tokens",
        "Cifra el historial de la conversación",
      ],
      correctIndex: 1,
      explanation:
        "Compaction resume automáticamente el contexto antiguo cuando se acerca al límite de la ventana, extendiendo la longitud efectiva de contexto y manteniendo pequeño el contexto activo. Es la estrategia recomendada porque gestiona el contexto automáticamente, sin resumen del lado cliente.",
    },
    {
      question: "Según la documentación, ¿cómo se posiciona context editing frente a compaction?",
      options: [
        "Context editing es la estrategia principal; compaction es un caso raro",
        "Context editing es la herramienta de control fino para escenarios específicos; la compaction del lado servidor es generalmente preferible para la mayoría de casos",
        "Son incompatibles entre sí",
        "Ambas están deprecadas",
      ],
      correctIndex: 1,
      explanation:
        "La documentación posiciona context editing como control fino para escenarios concretos (limpiar resultados de herramienta o bloques de razonamiento), no como estrategia principal. Para la mayoría de los casos, la compaction del lado servidor es preferible.",
    },
    {
      question: "¿En qué estado están compaction y context editing, y qué implica?",
      options: [
        "GA; estabilidad garantizada en producción",
        "Beta; requieren cabecera beta (p. ej. compact-2026-01-12) y pueden cambiar con aviso",
        "Retirados; ya no funcionan",
        "Legacy; reemplazados por Text Completions",
      ],
      correctIndex: 1,
      explanation:
        "Ambos mecanismos están en beta, disponibles en las cinco plataformas también en beta. Compaction se activa con la cabecera compact-2026-01-12. Al ser beta, pueden cambiar significativamente con aviso y no están garantizados para uso continuado en producción.",
    },
  ],
};
