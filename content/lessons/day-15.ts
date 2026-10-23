import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 14.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-tools-detail.md (§1 defer_loading, §6 Tool
// Search). Terminología oficial. Req 3.10.
export const day15: Lesson = {
  day: 15,
  slug: "tool-search",
  title: "Tool search",
  section: "MEDIO",
  estimatedMinutes: 24,
  icon: "concept-herramientas-servidor",
  objectives: [
    "Escalar a miles de herramientas descubriéndolas bajo demanda en lugar de meterlas todas en el prompt",
    "Combinar defer_loading con una herramienta de búsqueda (BM25 o regex)",
    "Entender el flujo: buscar → tool_search_tool_result → cargar vía tool_reference",
    "Reconocer el doble beneficio: menos contexto consumido y mejor precisión de selección",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Meter cien herramientas en el prompt de sistema tiene dos costes: consume contexto y confunde al modelo, que se equivoca más al elegir cuando ve demasiadas opciones. Tool search resuelve ambos problemas descubriendo y cargando herramientas bajo demanda, lo que permite escalar a miles de ellas.",
    },
    { type: "heading", level: 2, text: "El mecanismo en cuatro pasos" },
    {
      type: "list",
      ordered: true,
      items: [
        "Declaras tus herramientas con defer_loading true, de modo que no entran en el prompt de sistema inicial.",
        "Añades una herramienta de búsqueda: BM25 para relevancia léxica o regex para coincidencia de patrones.",
        "El modelo busca, y el resultado llega como un bloque tool_search_tool_result.",
        "Las herramientas seleccionadas entran en contexto vía bloques tool_reference.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Tool search", icon: "concept-herramientas-servidor" },
        { service: "Tool use", icon: "concept-herramientas" },
        { service: "Gestión de contexto", icon: "concept-contexto" },
      ],
    },
    {
      type: "code",
      lang: "json",
      title: "Herramientas diferidas + buscador BM25",
      code:
        "{\n" +
        "  \"tools\": [\n" +
        "    { \"type\": \"tool_search_tool_bm25\", \"name\": \"tool_search_tool_bm25\" },\n" +
        "    {\n" +
        "      \"name\": \"consultar_saldo\",\n" +
        "      \"description\": \"Consulta el saldo de una cuenta. Úsala para preguntas sobre saldos.\",\n" +
        "      \"input_schema\": { \"type\": \"object\", \"properties\": {}, \"required\": [] },\n" +
        "      \"defer_loading\": true\n" +
        "    }\n" +
        "  ]\n" +
        "}",
      highlightLines: [3, 8],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Las herramientas de búsqueda aceptan tanto la forma fechada (tool_search_tool_bm25_20251119) como la sin fecha (tool_search_tool_bm25). Es una excepción al patrón general de versionado fechado de la plataforma.",
    },
    { type: "heading", level: 2, text: "El doble beneficio" },
    {
      type: "paragraph",
      text:
        "La documentación declara dos ventajas. La primera es obvia: optimiza el uso de contexto, porque las herramientas diferidas no ocupan tokens hasta que la búsqueda las selecciona. La segunda es menos evidente pero igual de importante: mejora la precisión de selección de herramienta. Con menos herramientas visibles a la vez, el modelo se equivoca menos al elegir cuál usar.",
    },
    {
      type: "callout",
      variant: "success",
      text:
        "BM25 para relevancia léxica (busca por términos), regex para coincidencia de patrones (busca por forma del nombre o parámetros). Elige según cómo quieras que el modelo descubra sus herramientas; puedes incluso declarar ambas.",
    },
    {
      type: "checklist",
      title: "Checklist de tool search",
      items: [
        "Marco las herramientas que no necesito siempre con defer_loading true.",
        "Añado una herramienta de búsqueda (BM25 y/o regex).",
        "Manejo el bloque tool_search_tool_result que devuelve la búsqueda.",
        "Dejo que las herramientas seleccionadas entren vía tool_reference.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Qué campo marca una herramienta para que NO entre en el prompt de sistema inicial y solo se cargue si la búsqueda la selecciona?",
      options: [
        "strict: true",
        "defer_loading: true",
        "cache_control: ephemeral",
        "disable_parallel_tool_use: true",
      ],
      correctIndex: 1,
      explanation:
        "defer_loading: true hace que la herramienta no se incluya en el prompt de sistema inicial; solo se carga cuando llega vía tool_reference desde tool search. Combinado con una herramienta de búsqueda, es el mecanismo para escalar a miles de herramientas.",
    },
    {
      question: "Además de ahorrar contexto, ¿qué segundo beneficio aporta tool search?",
      options: [
        "Acelera la facturación",
        "Mejora la precisión de selección de herramienta: con menos herramientas visibles a la vez, el modelo se equivoca menos al elegir",
        "Cifra las herramientas en reposo",
        "Convierte las herramientas de cliente en herramientas de servidor",
      ],
      correctIndex: 1,
      explanation:
        "El doble beneficio documentado: optimiza el uso de contexto (las diferidas no ocupan tokens hasta seleccionarse) y mejora la precisión de selección, porque con menos herramientas visibles a la vez el modelo elige mejor cuál usar.",
    },
    {
      question: "¿Cómo entran en contexto las herramientas que la búsqueda selecciona?",
      options: [
        "Se copian al prompt de sistema manualmente",
        "Vía bloques tool_reference, después de que la búsqueda devuelve un tool_search_tool_result",
        "No entran: el modelo las ejecuta sin verlas",
        "Mediante un nuevo endpoint /v1/tools",
      ],
      correctIndex: 1,
      explanation:
        "El flujo es: el modelo busca, el resultado llega como tool_search_tool_result, y las herramientas seleccionadas entran en contexto mediante bloques tool_reference. Así solo las relevantes consumen contexto, en lugar de todas desde el inicio.",
    },
  ],
};
