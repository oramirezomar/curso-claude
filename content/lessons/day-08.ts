import type { Lesson } from "@/lib/types";

// Capa_Temática: Streaming (Nivel MEDIO, dayRange [7, 17]).
// Tema: streaming de Messages API vía Server-Sent Events — eventos del flujo
// y manejo de errores / rate limits en streaming.
// Trazabilidad: Req 3.6, 3.23, 4.4, 5.4, 6.1-6.4, 9.1-9.4.
export const day08: Lesson = {
  day: 8,
  slug: "streaming-sse",
  title: "Streaming con SSE",
  section: "MEDIO",
  estimatedMinutes: 30,
  icon: "concept-streaming",
  objectives: [
    "Activar el streaming de Messages API con stream: true y consumir el flujo de Server-Sent Events (SSE)",
    "Identificar los tipos de evento del flujo: message_start, content_block_start/delta/stop, message_delta, message_stop y ping",
    "Reconstruir la respuesta a partir de los deltas incrementales (text, input_json y thinking)",
    "Manejar errores y rate limits dentro del flujo, incluido el evento error con overloaded_error",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "El streaming transmite la respuesta de forma incremental en lugar de esperar al mensaje completo. Se activa con stream: true en la petición a Messages API, y la respuesta llega como un flujo de Server-Sent Events (SSE). Cada evento lleva un nombre (por ejemplo event: message_stop) y un cuerpo JSON con el campo type correspondiente. Esto permite mostrar el texto a medida que se genera y reducir la latencia percibida.",
    },
    {
      type: "serviceIcon",
      items: [{ service: "Streaming SSE", icon: "concept-streaming" }],
    },
    { type: "heading", level: 2, text: "El flujo de eventos" },
    {
      type: "paragraph",
      text:
        "Un flujo bien formado sigue siempre la misma secuencia: un message_start que abre el mensaje, una serie de bloques de contenido (cada uno con su apertura, sus deltas y su cierre), uno o más message_delta con cambios de nivel superior, y un message_stop final.",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "message_start: contiene un objeto Message con content vacío y stop_reason en null.",
        "Una serie de bloques de contenido: cada uno con un content_block_start, uno o más content_block_delta y un content_block_stop. Cada bloque tiene un index que corresponde a su posición en el array content final.",
        "Uno o más message_delta: cambios de nivel superior en el objeto Message final (por ejemplo stop_reason y usage).",
        "Un message_stop final que cierra el flujo.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "El evento ping puede aparecer cualquier número de veces en cualquier punto del flujo: hay que ignorarlo. Además, según la política de versionado pueden añadirse tipos de evento nuevos, así que tu código debe manejar con elegancia los tipos que no conoce en lugar de romper.",
    },
    { type: "heading", level: 2, text: "Tipos de delta de bloque de contenido" },
    {
      type: "paragraph",
      text:
        "El contenido llega fragmentado dentro de los content_block_delta. Hay tres variantes de delta según lo que se esté generando, y la reconstrucción consiste en concatenar los fragmentos del bloque con el index correspondiente.",
    },
    {
      type: "list",
      items: [
        "Text delta: fragmentos de texto de un bloque text.",
        "Input JSON delta: fragmentos del JSON de entrada de una herramienta (bloque tool_use).",
        "Thinking delta: fragmentos de razonamiento de un bloque thinking.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Los conteos de tokens del campo usage en message_delta son ACUMULATIVOS, no incrementales: no hay que sumarlos entre eventos. El último message_delta trae el total.",
    },
    { type: "heading", level: 2, text: "Consumir el flujo con curl" },
    {
      type: "paragraph",
      text:
        "Para ver el flujo crudo basta con enviar stream: true y pedir a curl que no almacene en búfer la salida con --no-buffer. Así cada evento SSE aparece en la terminal conforme llega.",
    },
    {
      type: "code",
      lang: "bash",
      title: "Streaming crudo con curl --no-buffer",
      code:
        "curl https://api.anthropic.com/v1/messages \\\n" +
        "  --no-buffer \\\n" +
        "  -H \"x-api-key: $ANTHROPIC_API_KEY\" \\\n" +
        "  -H \"anthropic-version: 2023-06-01\" \\\n" +
        "  -H \"content-type: application/json\" \\\n" +
        "  -d '{\n" +
        "    \"model\": \"claude-sonnet-5\",\n" +
        "    \"max_tokens\": 1024,\n" +
        "    \"stream\": true,\n" +
        "    \"messages\": [{ \"role\": \"user\", \"content\": \"Cuenta hasta tres.\" }]\n" +
        "  }'",
      highlightLines: [2, 10],
    },
    {
      type: "code",
      lang: "text",
      title: "Fragmento del flujo SSE recibido",
      code:
        "event: message_start\n" +
        "data: {\"type\":\"message_start\",\"message\":{\"id\":\"msg_01...\",\"role\":\"assistant\",\"content\":[],\"stop_reason\":null}}\n" +
        "\n" +
        "event: content_block_start\n" +
        "data: {\"type\":\"content_block_start\",\"index\":0,\"content_block\":{\"type\":\"text\",\"text\":\"\"}}\n" +
        "\n" +
        "event: ping\n" +
        "data: {\"type\":\"ping\"}\n" +
        "\n" +
        "event: content_block_delta\n" +
        "data: {\"type\":\"content_block_delta\",\"index\":0,\"delta\":{\"type\":\"text_delta\",\"text\":\"Uno\"}}\n" +
        "\n" +
        "event: content_block_stop\n" +
        "data: {\"type\":\"content_block_stop\",\"index\":0}\n" +
        "\n" +
        "event: message_delta\n" +
        "data: {\"type\":\"message_delta\",\"delta\":{\"stop_reason\":\"end_turn\"},\"usage\":{\"output_tokens\":12}}\n" +
        "\n" +
        "event: message_stop\n" +
        "data: {\"type\":\"message_stop\"}",
      highlightLines: [1, 7, 16, 19],
    },
    { type: "heading", level: 2, text: "Consumir el flujo desde el SDK" },
    {
      type: "paragraph",
      text:
        "El SDK oficial abstrae el parseo de SSE: expone un stream iterable de eventos tipados, de modo que no tienes que trocear líneas data: a mano. El patrón habitual es iterar los eventos y reaccionar a los text_delta para ir imprimiendo texto.",
    },
    {
      type: "code",
      lang: "python",
      title: "Streaming con el SDK de Python",
      code:
        "from anthropic import Anthropic\n" +
        "\n" +
        "client = Anthropic()\n" +
        "\n" +
        "with client.messages.stream(\n" +
        "    model=\"claude-sonnet-5\",\n" +
        "    max_tokens=1024,\n" +
        "    messages=[{\"role\": \"user\", \"content\": \"Cuenta hasta tres.\"}],\n" +
        ") as stream:\n" +
        "    for text in stream.text_stream:\n" +
        "        print(text, end=\"\", flush=True)\n" +
        "    mensaje_final = stream.get_final_message()",
      highlightLines: [5, 10],
    },
    {
      type: "code",
      lang: "ts",
      title: "Streaming con el SDK de TypeScript",
      code:
        "import Anthropic from \"@anthropic-ai/sdk\";\n" +
        "\n" +
        "const client = new Anthropic();\n" +
        "\n" +
        "const stream = client.messages.stream({\n" +
        "  model: \"claude-sonnet-5\",\n" +
        "  max_tokens: 1024,\n" +
        "  messages: [{ role: \"user\", content: \"Cuenta hasta tres.\" }],\n" +
        "});\n" +
        "\n" +
        "stream.on(\"text\", (delta) => process.stdout.write(delta));\n" +
        "const mensajeFinal = await stream.finalMessage();",
      highlightLines: [5, 11],
    },
    { type: "heading", level: 2, text: "Errores y rate limits dentro del flujo" },
    {
      type: "paragraph",
      text:
        "El flujo no solo transporta contenido: la API también puede emitir un evento error en medio del stream. El caso típico es un overloaded_error, que fuera de streaming correspondería a un HTTP 529 (servicio sobrecargado). Tu consumidor debe estar preparado para recibir un evento error después de haber empezado a leer contenido.",
    },
    {
      type: "code",
      lang: "text",
      title: "Evento error recibido a mitad del flujo",
      code:
        "event: error\n" +
        "data: {\"type\":\"error\",\"error\":{\"type\":\"overloaded_error\",\"message\":\"Overloaded\"}}",
      highlightLines: [1, 2],
    },
    {
      type: "list",
      items: [
        "overloaded_error: el servicio está temporalmente sobrecargado (equivalente a HTTP 529). Reintenta con backoff exponencial.",
        "Rate limits: un HTTP 429 antes de abrir el flujo indica que superaste el límite de tasa; respeta la cabecera retry-after.",
        "Evento ping: ignóralo siempre, no afecta a la reconstrucción.",
        "Tipos de evento desconocidos: manéjalos con elegancia; la lista de eventos puede crecer por versionado.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Un rechazo por política puede manifestarse con stop_reason \"refusal\" cuando los clasificadores de streaming intervienen. No lo trates como contenido normal: es una parada controlada que debes manejar aparte.",
    },
    {
      type: "checklist",
      title: "Checklist para un consumidor de streaming robusto",
      items: [
        "Envía stream: true y, con curl, usa --no-buffer",
        "Agrupa los deltas por index para reconstruir cada bloque",
        "Trata el usage de message_delta como acumulativo, no lo sumes",
        "Ignora los eventos ping y tolera tipos de evento desconocidos",
        "Captura el evento error (overloaded_error) y reintenta con backoff",
        "Respeta retry-after ante un 429 de rate limit",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Cuál es la secuencia correcta de eventos de nivel superior en un flujo SSE bien formado?",
      options: [
        "content_block_start → message_start → message_stop",
        "message_start → bloques de contenido (start/delta/stop) → message_delta → message_stop",
        "message_delta → ping → message_start → content_block_delta",
        "message_stop → message_start → content_block_delta",
      ],
      correctIndex: 1,
      explanation:
        "El flujo abre con message_start (content vacío), sigue con una serie de bloques de contenido (cada uno con content_block_start, content_block_delta y content_block_stop), luego uno o más message_delta con cambios de nivel superior, y cierra con message_stop.",
    },
    {
      question:
        "Recibes un evento error con error.type \"overloaded_error\" a mitad del flujo. ¿Qué representa y cómo conviene reaccionar?",
      options: [
        "Un fallo de tu JSON de entrada; corrige el payload y reenvía de inmediato",
        "El fin normal del flujo; trátalo como message_stop",
        "Una sobrecarga temporal (equivalente a HTTP 529); reintenta con backoff exponencial",
        "Un ping que debes ignorar sin más",
      ],
      correctIndex: 2,
      explanation:
        "overloaded_error indica que el servicio está temporalmente sobrecargado (fuera de streaming sería un HTTP 529). No es un error de tu payload ni el cierre del flujo: lo adecuado es reintentar con backoff exponencial.",
    },
    {
      question: "Sobre el campo usage que llega en los eventos message_delta durante el streaming:",
      options: [
        "Es incremental y debes sumar los valores de cada message_delta",
        "Es acumulativo: no hay que sumarlo entre eventos",
        "Solo aparece en message_start, nunca en message_delta",
        "Debe ignorarse porque los pings lo invalidan",
      ],
      correctIndex: 1,
      explanation:
        "Los conteos de tokens de usage en message_delta son acumulativos, no incrementales. Sumarlos entre eventos daría un total inflado; el último message_delta ya trae el total.",
    },
  ],
};
