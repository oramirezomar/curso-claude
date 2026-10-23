import type { Lesson } from "@/lib/types";

// Capa_Temática: Tool use (Nivel MEDIO, dayRange [7, 17]).
// Tema: herramientas personalizadas — definir tools propias, el ciclo
// tool_use → ejecución → tool_result y el stop_reason "tool_use".
// Trazabilidad: Req 3.10, 4.4, 5.4, 6.1-6.4, 9.1-9.4.
export const day12: Lesson = {
  day: 12,
  slug: "tool-use-custom",
  title: "Tool use: herramientas propias",
  section: "MEDIO",
  estimatedMinutes: 30,
  icon: "concept-herramientas",
  objectives: [
    "Definir herramientas personalizadas con name, description e input_schema (JSON Schema 2020-12)",
    "Entender el ciclo tool use: tool_use del modelo → ejecución en tu código → tool_result de vuelta",
    "Reconocer el stop_reason \"tool_use\" como la señal de que debes ejecutar una o más herramientas",
    "Escribir descripciones de herramienta efectivas y saber cuándo activar strict",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "El tool use (uso de herramientas) permite que el modelo delegue trabajo en funciones que tú defines y ejecutas en tu propio código. Una herramienta personalizada (tipo Tool, type \"custom\") describe una capacidad —consultar un saldo, crear un ticket, llamar a tu base de datos— y el modelo decide cuándo y con qué argumentos invocarla. El modelo nunca ejecuta la herramienta: emite una intención de llamada y tú le devuelves el resultado.",
    },
    {
      type: "serviceIcon",
      items: [{ service: "Tool use", icon: "concept-herramientas" }],
    },
    { type: "heading", level: 2, text: "Anatomía de una herramienta personalizada" },
    {
      type: "paragraph",
      text:
        "Cada herramienta se declara dentro del array tools de la petición a Messages API. Los dos campos obligatorios son name (el identificador con el que el modelo la invoca) e input_schema (un esquema JSON Schema 2020-12 que define la forma del input que la herramienta acepta). El campo description es opcional pero determinante: cuanto más detallado, mejor elige y mejor rellena los argumentos el modelo.",
    },
    {
      type: "list",
      items: [
        "name: obligatorio. Longitud 1–128, patrón ^[a-zA-Z0-9_-]{1,128}$. Aparece en los bloques tool_use.",
        "input_schema: obligatorio. JSON Schema 2020-12 que describe los parámetros de entrada.",
        "description: opcional pero el de mayor impacto; debe decir qué hace la herramienta y cuándo usarla.",
        "strict: opcional. Con true garantiza validación de esquema sobre nombres y entradas de herramienta.",
        "cache_control: punto de corte de caché de prompts en este bloque.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "La description es el campo con más impacto por unidad de esfuerzo en todo el diseño de herramientas. Una descripción rica sobre qué hace la herramienta y cuándo conviene usarla mejora notablemente el comportamiento del modelo.",
    },
    {
      type: "code",
      lang: "json",
      title: "Definición de una herramienta propia en el array tools",
      code:
        "{\n" +
        "  \"model\": \"claude-sonnet-5\",\n" +
        "  \"max_tokens\": 1024,\n" +
        "  \"tools\": [\n" +
        "    {\n" +
        "      \"name\": \"obtener_clima\",\n" +
        "      \"description\": \"Devuelve el clima actual de una ciudad. Úsala cuando el usuario pregunte por temperatura, lluvia o condiciones meteorológicas de un lugar concreto.\",\n" +
        "      \"input_schema\": {\n" +
        "        \"type\": \"object\",\n" +
        "        \"properties\": {\n" +
        "          \"ciudad\": {\n" +
        "            \"type\": \"string\",\n" +
        "            \"description\": \"Nombre de la ciudad, p. ej. 'Bogotá'\"\n" +
        "          },\n" +
        "          \"unidad\": {\n" +
        "            \"type\": \"string\",\n" +
        "            \"enum\": [\"celsius\", \"fahrenheit\"],\n" +
        "            \"description\": \"Unidad de temperatura\"\n" +
        "          }\n" +
        "        },\n" +
        "        \"required\": [\"ciudad\"]\n" +
        "      }\n" +
        "    }\n" +
        "  ],\n" +
        "  \"messages\": [\n" +
        "    { \"role\": \"user\", \"content\": \"¿Qué temperatura hace en Bogotá?\" }\n" +
        "  ]\n" +
        "}",
      highlightLines: [6, 7],
    },
    { type: "heading", level: 2, text: "El ciclo: tool_use → ejecución → tool_result" },
    {
      type: "paragraph",
      text:
        "Cuando el modelo decide usar una herramienta, responde con un bloque tool_use y el campo stop_reason vale \"tool_use\". Ese bloque trae un id, el name de la herramienta y el input ya construido por el modelo según tu esquema. Tu código ejecuta la función real, y en el siguiente turno devuelves un mensaje de rol user con un bloque tool_result que referencia ese id mediante tool_use_id.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Envías la petición con el array tools y el mensaje del usuario.",
        "El modelo responde con stop_reason \"tool_use\" y uno o más bloques tool_use (id, name, input).",
        "Tu código ejecuta cada herramienta con el input recibido.",
        "Reenvías el historial añadiendo un mensaje user con un bloque tool_result por cada tool_use_id.",
        "El modelo integra los resultados y produce la respuesta final (normalmente con stop_reason \"end_turn\").",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "stop_reason \"tool_use\" no es un error ni el final del turno: es la señal de que debes ejecutar la herramienta y volver a llamar a la API con el tool_result. Si el modelo pide varias herramientas en paralelo, devuelve un tool_result por cada tool_use_id en el mismo mensaje user.",
    },
    {
      type: "code",
      lang: "json",
      title: "Respuesta del modelo con stop_reason \"tool_use\"",
      code:
        "{\n" +
        "  \"id\": \"msg_01A9...\",\n" +
        "  \"type\": \"message\",\n" +
        "  \"role\": \"assistant\",\n" +
        "  \"model\": \"claude-sonnet-5\",\n" +
        "  \"stop_reason\": \"tool_use\",\n" +
        "  \"content\": [\n" +
        "    { \"type\": \"text\", \"text\": \"Déjame consultar el clima actual.\" },\n" +
        "    {\n" +
        "      \"type\": \"tool_use\",\n" +
        "      \"id\": \"toolu_01B2...\",\n" +
        "      \"name\": \"obtener_clima\",\n" +
        "      \"input\": { \"ciudad\": \"Bogotá\", \"unidad\": \"celsius\" }\n" +
        "    }\n" +
        "  ]\n" +
        "}",
      highlightLines: [5, 10, 11, 12],
    },
    {
      type: "code",
      lang: "json",
      title: "Devolver el resultado con un bloque tool_result",
      code:
        "{\n" +
        "  \"role\": \"user\",\n" +
        "  \"content\": [\n" +
        "    {\n" +
        "      \"type\": \"tool_result\",\n" +
        "      \"tool_use_id\": \"toolu_01B2...\",\n" +
        "      \"content\": \"18°C, parcialmente nublado\"\n" +
        "    }\n" +
        "  ]\n" +
        "}",
      highlightLines: [5, 6],
    },
    { type: "heading", level: 2, text: "El ciclo completo desde el SDK" },
    {
      type: "paragraph",
      text:
        "En la práctica el bucle se implementa una sola vez: enviar, detectar stop_reason \"tool_use\", ejecutar, reenviar. Este es el patrón en el SDK oficial de Python, que reconstruye el historial añadiendo la respuesta del asistente y el mensaje user con el tool_result.",
    },
    {
      type: "code",
      lang: "python",
      title: "Bucle de tool use con el SDK de Python",
      code:
        "from anthropic import Anthropic\n" +
        "\n" +
        "client = Anthropic()\n" +
        "\n" +
        "tools = [{\n" +
        "    \"name\": \"obtener_clima\",\n" +
        "    \"description\": \"Devuelve el clima actual de una ciudad. Úsala cuando el usuario pregunte por el tiempo.\",\n" +
        "    \"input_schema\": {\n" +
        "        \"type\": \"object\",\n" +
        "        \"properties\": {\n" +
        "            \"ciudad\": {\"type\": \"string\"},\n" +
        "            \"unidad\": {\"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"]},\n" +
        "        },\n" +
        "        \"required\": [\"ciudad\"],\n" +
        "    },\n" +
        "}]\n" +
        "\n" +
        "def obtener_clima(ciudad, unidad=\"celsius\"):\n" +
        "    # Aquí llamarías a tu servicio real\n" +
        "    return \"18°C, parcialmente nublado\"\n" +
        "\n" +
        "messages = [{\"role\": \"user\", \"content\": \"¿Qué temperatura hace en Bogotá?\"}]\n" +
        "resp = client.messages.create(\n" +
        "    model=\"claude-sonnet-5\", max_tokens=1024, tools=tools, messages=messages,\n" +
        ")\n" +
        "\n" +
        "if resp.stop_reason == \"tool_use\":\n" +
        "    tool_use = next(b for b in resp.content if b.type == \"tool_use\")\n" +
        "    resultado = obtener_clima(**tool_use.input)\n" +
        "    messages.append({\"role\": \"assistant\", \"content\": resp.content})\n" +
        "    messages.append({\n" +
        "        \"role\": \"user\",\n" +
        "        \"content\": [{\n" +
        "            \"type\": \"tool_result\",\n" +
        "            \"tool_use_id\": tool_use.id,\n" +
        "            \"content\": resultado,\n" +
        "        }],\n" +
        "    })\n" +
        "    final = client.messages.create(\n" +
        "        model=\"claude-sonnet-5\", max_tokens=1024, tools=tools, messages=messages,\n" +
        "    )\n" +
        "    print(final.content[0].text)",
      highlightLines: [26, 27, 28],
    },
    {
      type: "code",
      lang: "ts",
      title: "El mismo ciclo con el SDK de TypeScript",
      code:
        "import Anthropic from \"@anthropic-ai/sdk\";\n" +
        "\n" +
        "const client = new Anthropic();\n" +
        "\n" +
        "const tools = [{\n" +
        "  name: \"obtener_clima\",\n" +
        "  description: \"Devuelve el clima actual de una ciudad. Úsala cuando el usuario pregunte por el tiempo.\",\n" +
        "  input_schema: {\n" +
        "    type: \"object\" as const,\n" +
        "    properties: {\n" +
        "      ciudad: { type: \"string\" },\n" +
        "      unidad: { type: \"string\", enum: [\"celsius\", \"fahrenheit\"] },\n" +
        "    },\n" +
        "    required: [\"ciudad\"],\n" +
        "  },\n" +
        "}];\n" +
        "\n" +
        "const messages = [{ role: \"user\" as const, content: \"¿Qué temperatura hace en Bogotá?\" }];\n" +
        "const resp = await client.messages.create({\n" +
        "  model: \"claude-sonnet-5\", max_tokens: 1024, tools, messages,\n" +
        "});\n" +
        "\n" +
        "if (resp.stop_reason === \"tool_use\") {\n" +
        "  const toolUse = resp.content.find((b) => b.type === \"tool_use\");\n" +
        "  // Ejecutas tu función real y devuelves el tool_result con el mismo tool_use_id\n" +
        "}",
      highlightLines: [22, 23],
    },
    {
      type: "callout",
      variant: "success",
      text:
        "Para escalar a muchas herramientas, combina defer_loading: true con tool search: las herramientas no entran en el prompt de sistema inicial y solo se cargan vía tool_reference cuando la búsqueda las selecciona. Eso optimiza el contexto y mejora la precisión de selección.",
    },
    {
      type: "checklist",
      title: "Checklist al definir una herramienta propia",
      items: [
        "name válido (1–128, patrón ^[a-zA-Z0-9_-]{1,128}$)",
        "input_schema en JSON Schema 2020-12 con required explícito",
        "description que diga qué hace y cuándo usarla",
        "El código detecta stop_reason \"tool_use\" y ejecuta la herramienta",
        "Cada tool_result referencia el tool_use_id correcto",
      ],
    },
  ],
  selfCheck: [
    {
      question:
        "¿Qué dos campos son obligatorios al definir una herramienta personalizada en el array tools?",
      options: [
        "description y strict",
        "name e input_schema",
        "cache_control y defer_loading",
        "tool_use_id y content",
      ],
      correctIndex: 1,
      explanation:
        "name (identificador con el que el modelo la invoca) e input_schema (JSON Schema 2020-12 que describe el input) son los únicos obligatorios. description es opcional pero determinante; strict, cache_control y defer_loading son opcionales.",
    },
    {
      question:
        "El modelo responde con stop_reason \"tool_use\" y un bloque tool_use. ¿Qué debe hacer tu código?",
      options: [
        "Tratarlo como un error y reintentar la petición sin tools",
        "Ejecutar la herramienta y reenviar el historial con un tool_result que referencie el tool_use_id",
        "Asumir que el turno terminó y mostrar el texto al usuario",
        "Esperar a que el modelo ejecute la herramienta por su cuenta",
      ],
      correctIndex: 1,
      explanation:
        "stop_reason \"tool_use\" indica que el modelo pide ejecutar una herramienta. Tu código la ejecuta y devuelve un mensaje user con un bloque tool_result por cada tool_use_id. El modelo nunca ejecuta la herramienta de cliente: lo haces tú.",
    },
    {
      question: "¿Por qué la documentación insiste tanto en la calidad de la description?",
      options: [
        "Porque sin ella la petición se rechaza con un error 400",
        "Porque define el formato de salida JSON de la herramienta",
        "Porque es el campo con más impacto en cómo el modelo elige y usa la herramienta",
        "Porque determina el límite de tokens de la respuesta",
      ],
      correctIndex: 2,
      explanation:
        "description es opcional, pero es el campo de mayor impacto por unidad de esfuerzo: cuanto mejor explique qué hace la herramienta y cuándo usarla, mejor la selecciona el modelo y mejor rellena sus argumentos.",
    },
  ],
};
