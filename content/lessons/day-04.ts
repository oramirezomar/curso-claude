import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 13.1). Fuente de verdad técnica:
// docs-referencia/claude/claude-messages-detail.md (§1 Parámetros, §2 Bloques
// de contenido, §4 Respuesta) y claude-reference-claude-com.md (§4
// Autenticación y cabeceras). Terminología oficial. Req 3.4, 9.1–9.5.
export const day04: Lesson = {
  day: 4,
  slug: "messages-api-esencial",
  title: "Messages API: lo esencial",
  section: "BÁSICO",
  estimatedMinutes: 25,
  icon: "concept-mensajes",
  objectives: [
    "Construir una petición válida a POST /v1/messages con sus parámetros obligatorios model, messages y max_tokens",
    "Entender el papel del prompt de sistema (system) y de los turnos alternos user/assistant, incluida la técnica de prefill",
    "Enviar una petición con curl y con el SDK, con las cabeceras correctas de autenticación y versionado",
    "Leer el objeto Message de respuesta: content, stop_reason y usage",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "La Messages API es el núcleo de la Claude Developer Platform: casi todo lo demás se construye encima de POST /v1/messages. Es una API REST sobre https://api.anthropic.com. En esta lección montamos una petición mínima válida, la enviamos con curl y con el SDK, y leemos la respuesta.",
    },
    { type: "heading", level: 2, text: "Parámetros obligatorios" },
    {
      type: "paragraph",
      text:
        "Una petición a la Messages API tiene exactamente tres parámetros obligatorios. Todo lo demás es opcional.",
    },
    {
      type: "list",
      items: [
        "model — el modelo que completará el prompt (por ejemplo claude-sonnet-5).",
        "messages — el array de mensajes de entrada, con turnos de rol user y assistant.",
        "max_tokens — el máximo de tokens a generar. Es un techo absoluto, no un objetivo: el modelo puede parar antes. El valor máximo admitido varía por modelo.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Messages API", icon: "concept-mensajes" },
        { service: "Autenticación y versionado", icon: "concept-auth" },
        { service: "Modelos y precios", icon: "concept-modelos" },
      ],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Caso especial: max_tokens igual a 0 no genera respuesta; sirve para poblar la caché de prompt (pre-calentamiento). Fuera de ese uso, cada petición necesita un max_tokens mayor que 0.",
    },
    { type: "heading", level: 3, text: "La forma de un payload" },
    {
      type: "paragraph",
      text:
        "Los payloads de la Messages API son JSON. Un content en forma de string es un atajo para un array de un solo bloque de texto. Este es el payload mínimo con un prompt de sistema:",
    },
    {
      type: "code",
      lang: "json",
      title: "Payload de POST /v1/messages",
      code:
        "{\n  \"model\": \"claude-sonnet-5\",\n  \"max_tokens\": 1024,\n  \"system\": \"Eres un asistente conciso que responde en español.\",\n  \"messages\": [\n    { \"role\": \"user\", \"content\": \"Resume en una frase qué es la Messages API.\" }\n  ]\n}",
      highlightLines: [2, 3],
    },
    { type: "heading", level: 2, text: "Roles, system y prefill" },
    {
      type: "paragraph",
      text:
        "Los modelos están entrenados para operar sobre turnos conversacionales alternos de user y assistant. El prompt de sistema (system) va aparte, en un parámetro de nivel superior: aporta contexto e instrucciones, típicamente un rol u objetivo, y no es un mensaje del array messages. El límite es de 100 000 mensajes en una sola petición.",
    },
    {
      type: "paragraph",
      text:
        "Si el último mensaje del array tiene rol assistant, la respuesta continúa inmediatamente desde ese contenido. Es la técnica de prefill: constriñes el inicio de la respuesta del modelo. Útil, por ejemplo, para forzar que empiece por un carácter concreto o por un formato dado.",
    },
    {
      type: "code",
      lang: "json",
      title: "Prefill: constreñir la respuesta con un turno assistant final",
      code:
        "{\n  \"model\": \"claude-sonnet-5\",\n  \"max_tokens\": 256,\n  \"messages\": [\n    { \"role\": \"user\", \"content\": \"Dame un objeto JSON con las claves nombre y edad.\" },\n    { \"role\": \"assistant\", \"content\": \"{\" }\n  ]\n}",
    },
    { type: "heading", level: 2, text: "Enviar la petición" },
    {
      type: "paragraph",
      text:
        "Toda petición debe enviar la cabecera anthropic-version. Para autenticar, la vía vigente es Authorization: Bearer <token>; x-api-key sigue soportada como alternativa legacy. Los SDKs ponen autenticación, versión y content-type por ti. Este es el ejemplo con curl:",
    },
    {
      type: "code",
      lang: "bash",
      title: "Petición con curl",
      code:
        "curl https://api.anthropic.com/v1/messages \\\n  -H \"Authorization: Bearer $ANTHROPIC_API_KEY\" \\\n  -H \"anthropic-version: 2023-06-01\" \\\n  -H \"content-type: application/json\" \\\n  -d '{\n    \"model\": \"claude-sonnet-5\",\n    \"max_tokens\": 1024,\n    \"messages\": [\n      { \"role\": \"user\", \"content\": \"Hola, Claude\" }\n    ]\n  }'",
    },
    {
      type: "paragraph",
      text:
        "Con el SDK oficial la misma petición queda más compacta, porque el cliente se encarga de las cabeceras. En Python:",
    },
    {
      type: "code",
      lang: "python",
      title: "Misma petición con el SDK de Python",
      code:
        "from anthropic import Anthropic\n\nclient = Anthropic()  # lee ANTHROPIC_API_KEY del entorno\n\nmessage = client.messages.create(\n    model=\"claude-sonnet-5\",\n    max_tokens=1024,\n    system=\"Eres un asistente conciso que responde en español.\",\n    messages=[\n        {\"role\": \"user\", \"content\": \"Hola, Claude\"},\n    ],\n)\n\nprint(message.content[0].text)\nprint(message.stop_reason, message.usage.output_tokens)",
    },
    { type: "heading", level: 2, text: "Leer la respuesta: el objeto Message" },
    {
      type: "paragraph",
      text:
        "La respuesta es un objeto Message con role siempre 'assistant'. Sus tres campos que más mirarás son content (el array de bloques de contenido de la respuesta), stop_reason (por qué se detuvo) y usage (el consumo para facturación y límites de tasa).",
    },
    {
      type: "code",
      lang: "json",
      title: "Objeto Message de respuesta (recortado)",
      code:
        "{\n  \"type\": \"message\",\n  \"id\": \"msg_01XFDUDYJgAACzvnptvVoYEL\",\n  \"role\": \"assistant\",\n  \"model\": \"claude-sonnet-5\",\n  \"content\": [\n    { \"type\": \"text\", \"text\": \"Hola. ¿En qué puedo ayudarte?\" }\n  ],\n  \"stop_reason\": \"end_turn\",\n  \"stop_sequence\": null,\n  \"usage\": { \"input_tokens\": 12, \"output_tokens\": 9 }\n}",
      highlightLines: [8, 11],
    },
    {
      type: "list",
      items: [
        "stop_reason end_turn: el modelo llegó a un punto de parada natural.",
        "stop_reason max_tokens: se alcanzó el techo de max_tokens o el máximo del modelo.",
        "stop_reason tool_use: el modelo invocó una o más herramientas.",
        "stop_reason stop_sequence: se generó una de tus secuencias de parada personalizadas.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "stop_reason puede traer valores que un cliente antiguo no espera: pause_turn (un turno largo se pausó; puedes reenviar la respuesta tal cual para continuar), refusal y model_context_window_exceeded. En modo no-streaming stop_reason nunca es null; en streaming es null en message_start y no-null después.",
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Sobre usage: el total de tokens de entrada es la suma de input_tokens, cache_creation_input_tokens y cache_read_input_tokens (no están incluidos unos en otros). Y output_tokens es distinto de cero incluso para una respuesta de cadena vacía.",
    },
  ],
  selfCheck: [
    {
      question: "¿Cuáles son los tres parámetros OBLIGATORIOS de POST /v1/messages?",
      options: [
        "system, stream y stop_sequences",
        "model, messages y max_tokens",
        "model, temperature y top_p",
        "messages, tools y tool_choice",
      ],
      correctIndex: 1,
      explanation:
        "Los únicos parámetros obligatorios son model (el modelo), messages (los turnos de entrada) y max_tokens (el techo de tokens a generar). system, stream y stop_sequences son opcionales; temperature y top_p están deprecados.",
    },
    {
      question:
        "Si el último mensaje del array messages tiene rol assistant, ¿qué ocurre?",
      options: [
        "La API devuelve un error 400 porque los roles deben alternar y terminar en user",
        "Se ignora ese mensaje",
        "La respuesta continúa inmediatamente desde ese contenido (técnica de prefill)",
        "El modelo reinicia la conversación desde cero",
      ],
      correctIndex: 2,
      explanation:
        "Cuando el último mensaje es de rol assistant, la respuesta continúa desde ese contenido. Es la técnica de prefill, que permite constreñir el inicio de la respuesta del modelo (por ejemplo, forzar que empiece por '{').",
    },
    {
      question:
        "En el objeto Message de respuesta, ¿qué campo indica por qué se detuvo la generación y qué valor corresponde a una parada natural?",
      options: [
        "usage, con el valor done",
        "stop_reason, con el valor end_turn",
        "content, con el valor stop",
        "role, con el valor assistant",
      ],
      correctIndex: 1,
      explanation:
        "stop_reason indica el motivo de la parada. end_turn significa que el modelo llegó a un punto de parada natural. Otros valores son max_tokens, stop_sequence, tool_use y los más recientes pause_turn, refusal y model_context_window_exceeded.",
    },
  ],
};
