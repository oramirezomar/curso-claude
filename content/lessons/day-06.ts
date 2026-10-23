import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 13.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-messages-detail.md (§2 Bloques de Contenido de
// Entrada; §4 ContentBlock de respuesta). Terminología oficial. Req 3.4.
export const day06: Lesson = {
  day: 6,
  slug: "bloques-de-contenido",
  title: "Bloques de contenido",
  section: "BÁSICO",
  estimatedMinutes: 24,
  icon: "concept-mensajes",
  objectives: [
    "Entender que content es una unión discriminada por type, tanto en entrada como en salida",
    "Clasificar los bloques por familia: básicos (text, image, document, search_result), de razonamiento (thinking) y de herramientas (tool_use, tool_result)",
    "Construir entrada multimodal combinando texto, imágenes y PDFs en un mismo mensaje",
    "Reconocer que casi todo bloque admite cache_control para crear un punto de corte de caché",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "En la Messages API, content no es un simple string: es un array de bloques, y cada bloque es un objeto discriminado por su campo type. Esa estructura es la que permite mezclar texto, imágenes y documentos en una misma petición, y la que hace que la respuesta pueda traer razonamiento, llamadas a herramientas y texto en bloques separados. Un content en forma de string es solo un atajo para un array de un único bloque text.",
    },
    { type: "heading", level: 2, text: "Bloques básicos" },
    {
      type: "list",
      items: [
        "text: el bloque base. Campo text (mínimo 1 carácter). Admite cache_control y citations.",
        "image: una imagen aportada como base64, por URL o desde la Files API (tres formas de source).",
        "document: la vía para PDFs y documentos de texto. Admite cinco tipos de source.",
        "search_result: resultados de búsqueda para RAG con citas naturales (content, source, title).",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Messages API", icon: "concept-mensajes" },
        { service: "Tool use", icon: "concept-herramientas" },
        { service: "Thinking y effort", icon: "concept-thinking" },
      ],
    },
    {
      type: "code",
      lang: "json",
      title: "Entrada multimodal: texto + imagen por URL",
      code:
        "{\n" +
        "  \"role\": \"user\",\n" +
        "  \"content\": [\n" +
        "    { \"type\": \"text\", \"text\": \"¿Qué muestra esta gráfica?\" },\n" +
        "    {\n" +
        "      \"type\": \"image\",\n" +
        "      \"source\": { \"type\": \"url\", \"url\": \"https://ejemplo.com/grafica.png\" }\n" +
        "    }\n" +
        "  ]\n" +
        "}",
      highlightLines: [4, 6],
    },
    { type: "heading", level: 2, text: "Bloques de razonamiento" },
    {
      type: "paragraph",
      text:
        "Cuando el razonamiento está activo, la respuesta incluye bloques de pensamiento antes de la respuesta final. Hay dos tipos: thinking, con los campos signature y thinking (la signature es la que permite la continuidad multi-turno), y redacted_thinking, con un campo data, que se devuelve cuando la visualización del razonamiento está configurada como omitida.",
    },
    { type: "heading", level: 2, text: "Bloques de herramientas" },
    {
      type: "list",
      items: [
        "tool_use: invocación de una herramienta de cliente (id, name, input).",
        "tool_result: el resultado que devuelves al modelo (tool_use_id, content). Su content admite texto, imágenes, search_result, document y más.",
        "server_tool_use: invocación de una herramienta de servidor (web_search, web_fetch, code_execution y otras).",
        "tool_reference: referencia a una herramienta, incluible dentro de tool_result (usada por tool search).",
        "container_upload: sube un archivo al contenedor de ejecución de código.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Los bloques de la respuesta son el espejo de los de entrada, sin el sufijo Param: TextBlock, ThinkingBlock, ToolUseBlock, ServerToolUseBlock, etc. Por eso el mismo modelo mental de bloques sirve para construir la petición y para leer la respuesta.",
    },
    { type: "heading", level: 2, text: "cache_control: puntos de corte de caché" },
    {
      type: "paragraph",
      text:
        "Casi todos los bloques admiten un campo cache_control para marcar un punto de corte de caché de prompts. El único tipo soportado hoy es ephemeral, con un ttl que por defecto es \"5m\" y admite \"1h\". Veremos la mecánica completa de la caché más adelante; aquí lo importante es que el punto de corte se declara a nivel de bloque.",
    },
    {
      type: "code",
      lang: "json",
      title: "Un bloque de texto marcado como punto de corte de caché",
      code:
        "{\n" +
        "  \"type\": \"text\",\n" +
        "  \"text\": \"<documento largo y estable que se reutiliza entre peticiones>\",\n" +
        "  \"cache_control\": { \"type\": \"ephemeral\", \"ttl\": \"1h\" }\n" +
        "}",
      highlightLines: [4],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "El bloque document es la vía oficial para PDFs, y el soporte de PDF es elegible para ZDR. Pero si en vez de incrustar el PDF en cada petición lo subes con la Files API y lo referencias, ganas reutilización a cambio de perder la elegibilidad ZDR: la Files API no es elegible. Es una decisión de arquitectura, no de conveniencia.",
    },
    {
      type: "checklist",
      title: "Checklist al construir content",
      items: [
        "Uso un array de bloques cuando combino modalidades; el string es solo atajo de un text.",
        "Elijo el tipo de bloque correcto: image para imágenes, document para PDFs.",
        "Sé que la respuesta trae bloques espejo (TextBlock, ThinkingBlock, ToolUseBlock).",
        "Marco cache_control en el último bloque estable que quiero cachear.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Qué es content en un mensaje de la Messages API?",
      options: [
        "Siempre un string de texto plano",
        "Una unión discriminada por type: un array de bloques (text, image, document, tool_use, thinking, ...), donde un string es solo el atajo de un único bloque text",
        "Un objeto con un único campo html",
        "Un array que solo admite bloques de tipo text",
      ],
      correctIndex: 1,
      explanation:
        "content es un array de bloques discriminados por type. Un string es un atajo para un array de un solo bloque text. Esa estructura permite combinar texto, imágenes y documentos en entrada, y recibir texto, razonamiento y llamadas a herramientas en la respuesta.",
    },
    {
      question: "¿Cuál es la vía correcta para enviar un PDF a Claude dentro de un mensaje?",
      options: [
        "Un bloque image con el PDF en base64",
        "Un bloque text con el PDF pegado como texto",
        "Un bloque document, que admite PDFs y documentos de texto con varios tipos de source",
        "No se pueden enviar PDFs a la Messages API",
      ],
      correctIndex: 2,
      explanation:
        "El bloque document es la vía para PDFs y documentos de texto, con cinco tipos de source. El bloque image es para imágenes. El soporte de PDF es elegible para ZDR cuando se incrusta; subirlo por la Files API gana reutilización pero pierde elegibilidad ZDR.",
    },
    {
      question: "Sobre cache_control en los bloques de contenido, ¿qué es cierto?",
      options: [
        "Solo el prompt de sistema puede llevar cache_control",
        "Casi todos los bloques lo admiten; el único tipo soportado es ephemeral, con ttl por defecto \"5m\" y opción \"1h\"",
        "Acepta cualquier valor de ttl en segundos arbitrarios",
        "Es obligatorio en todos los bloques",
      ],
      correctIndex: 1,
      explanation:
        "Casi todos los bloques admiten cache_control para marcar un punto de corte de caché. El único tipo soportado hoy es ephemeral, con ttl por defecto \"5m\" y opción \"1h\". No es obligatorio y el punto de corte se declara a nivel de bloque.",
    },
  ],
};
