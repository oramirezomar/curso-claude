import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 14.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-messages-detail.md (§3 output_config.format).
// Terminología oficial. Req 3.9.
export const day11: Lesson = {
  day: 11,
  slug: "salidas-estructuradas",
  title: "Salidas estructuradas",
  section: "MEDIO",
  estimatedMinutes: 24,
  icon: "concept-salidas",
  objectives: [
    "Forzar una respuesta JSON conforme a un esquema con output_config.format de tipo json_schema",
    "Diferenciar salidas estructuradas de tool use: cuándo quieres datos conformes y cuándo quieres que el modelo actúe",
    "Entender la elegibilidad ZDR con matices: los prompts y salidas no se almacenan, pero los esquemas se cachean 24h",
    "Combinar salidas estructuradas con la lógica de tu aplicación de forma fiable",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Cuando necesitas que la respuesta sea JSON válido y conforme a una forma concreta —para alimentar tu base de datos, tu UI o tu pipeline— no basta con pedirlo en el prompt y rezar. Las salidas estructuradas garantizan conformidad con un esquema JSON que tú defines, mediante output_config.format.",
    },
    { type: "heading", level: 2, text: "El mecanismo" },
    {
      type: "paragraph",
      text:
        "Fijas output_config.format con type json_schema y el esquema JSON deseado. La plataforma garantiza que la salida se ajusta a ese esquema, eliminando el parseo defensivo y los reintentos por JSON malformado.",
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Salidas estructuradas", icon: "concept-salidas" },
        { service: "Tool use", icon: "concept-herramientas" },
        { service: "Messages API", icon: "concept-mensajes" },
      ],
    },
    {
      type: "code",
      lang: "json",
      title: "output_config.format con un esquema JSON",
      code:
        "{\n" +
        "  \"model\": \"claude-sonnet-5\",\n" +
        "  \"max_tokens\": 512,\n" +
        "  \"output_config\": {\n" +
        "    \"format\": {\n" +
        "      \"type\": \"json_schema\",\n" +
        "      \"schema\": {\n" +
        "        \"type\": \"object\",\n" +
        "        \"properties\": {\n" +
        "          \"titular\": { \"type\": \"string\" },\n" +
        "          \"sentimiento\": { \"type\": \"string\", \"enum\": [\"positivo\", \"neutro\", \"negativo\"] },\n" +
        "          \"monto\": { \"type\": \"number\" }\n" +
        "        },\n" +
        "        \"required\": [\"titular\", \"sentimiento\"]\n" +
        "      }\n" +
        "    }\n" +
        "  },\n" +
        "  \"messages\": [{ \"role\": \"user\", \"content\": \"Analiza este movimiento de cuenta: ...\" }]\n" +
        "}",
      highlightLines: [5, 6],
    },
    { type: "heading", level: 2, text: "Salidas estructuradas frente a tool use" },
    {
      type: "paragraph",
      text:
        "Es fácil confundirlos porque ambos usan JSON Schema, pero resuelven problemas distintos. Tool use es para que el modelo decida invocar una función y tú la ejecutes: el modelo quiere ACTUAR. Las salidas estructuradas son para que la respuesta final del modelo tenga una forma garantizada: quieres DATOS conformes, no una acción.",
    },
    {
      type: "comparison",
      lang: "ts",
      before: {
        title: "Tool use — el modelo quiere actuar",
        code:
          "// El modelo emite tool_use, tú ejecutas y\n" +
          "// devuelves tool_result. Hay ida y vuelta.\n" +
          "const resp = await client.messages.create({\n" +
          "  model: \"claude-sonnet-5\",\n" +
          "  max_tokens: 512,\n" +
          "  tools: [buscarCliente],\n" +
          "  messages,\n" +
          "});\n" +
          "if (resp.stop_reason === \"tool_use\") {\n" +
          "  // ejecutas la herramienta...\n" +
          "}",
      },
      after: {
        title: "Salidas estructuradas — quieres datos conformes",
        code:
          "// La respuesta final ya viene como JSON\n" +
          "// conforme al esquema. Sin ida y vuelta.\n" +
          "const resp = await client.messages.create({\n" +
          "  model: \"claude-sonnet-5\",\n" +
          "  max_tokens: 512,\n" +
          "  output_config: { format: { type: \"json_schema\", schema } },\n" +
          "  messages,\n" +
          "});\n" +
          "const datos = JSON.parse(resp.content[0].text);\n" +
          "// datos cumple el esquema garantizado",
      },
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Regla práctica: si el resultado alimenta tu sistema (parsear, guardar, mostrar), salidas estructuradas. Si el resultado es que el modelo llame a tu código para hacer algo (consultar, crear, modificar), tool use.",
    },
    { type: "heading", level: 2, text: "Elegibilidad ZDR con matices" },
    {
      type: "callout",
      variant: "warning",
      text:
        "Las salidas estructuradas son elegibles para ZDR, pero con una excepción documentada que importa en entornos regulados: tus prompts y las salidas de Claude NO se almacenan, pero los esquemas JSON SÍ se cachean del lado de Anthropic hasta 24 horas desde su último uso. El dato sensible (prompt y salida) no se retiene; la forma (el esquema) sí, temporalmente.",
    },
    {
      type: "checklist",
      title: "Checklist de salidas estructuradas",
      items: [
        "Defino el esquema con required explícito para los campos que no pueden faltar.",
        "Uso salidas estructuradas para datos conformes, tool use para acciones.",
        "Parseo la respuesta con la confianza de que cumple el esquema.",
        "Documento que el esquema se cachea 24h aunque prompt y salida no se almacenen (ZDR).",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Cuándo usar salidas estructuradas en lugar de tool use?",
      options: [
        "Cuando quieres que el modelo invoque una función que tú ejecutas",
        "Cuando quieres que la respuesta final del modelo tenga una forma JSON garantizada para alimentar tu sistema",
        "Nunca; son exactamente lo mismo",
        "Solo cuando trabajas con imágenes",
      ],
      correctIndex: 1,
      explanation:
        "Las salidas estructuradas garantizan que la respuesta final cumple un esquema JSON: las usas cuando quieres DATOS conformes para parsear, guardar o mostrar. Tool use es para que el modelo decida ACTUAR invocando una función que tú ejecutas, con ida y vuelta de tool_use/tool_result.",
    },
    {
      question: "Respecto a Zero Data Retention, ¿qué matiz tienen las salidas estructuradas?",
      options: [
        "No son elegibles para ZDR en absoluto",
        "Son elegibles: prompts y salidas no se almacenan, pero los esquemas JSON se cachean hasta 24h desde su último uso",
        "Almacenan todo durante 29 días",
        "Solo son elegibles en Amazon Bedrock",
      ],
      correctIndex: 1,
      explanation:
        "Las salidas estructuradas son elegibles para ZDR con una excepción: tus prompts y las salidas de Claude no se almacenan, pero los esquemas JSON sí se cachean del lado de Anthropic hasta 24 horas desde el último uso. El dato sensible no se retiene; la forma del esquema sí, temporalmente.",
    },
    {
      question: "¿Qué garantiza output_config.format con type json_schema?",
      options: [
        "Que la respuesta llega más rápido",
        "Que la salida se ajusta al esquema JSON definido, eliminando el parseo defensivo y los reintentos por JSON malformado",
        "Que el modelo ejecuta tus funciones automáticamente",
        "Que el prompt se cachea indefinidamente",
      ],
      correctIndex: 1,
      explanation:
        "output_config.format con json_schema garantiza conformidad de la salida con el esquema que defines. Eso elimina el parseo defensivo y los reintentos por JSON mal formado, haciendo fiable la integración con el resto de tu aplicación.",
    },
  ],
};
