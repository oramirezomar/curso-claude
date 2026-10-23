import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 13.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-messages-detail.md (§4 Respuesta: objeto
// Message, stop_reason, usage). Terminología oficial. Req 3.4.
export const day05: Lesson = {
  day: 5,
  slug: "messages-api-respuesta",
  title: "Messages API: la respuesta",
  section: "BÁSICO",
  estimatedMinutes: 22,
  icon: "concept-mensajes",
  objectives: [
    "Leer los campos del objeto Message de respuesta: content, role, model, stop_reason, stop_sequence y usage",
    "Interpretar los siete valores de stop_reason, incluidos los modernos pause_turn, refusal y model_context_window_exceeded",
    "Calcular el total de tokens de entrada sumando input_tokens, cache_creation_input_tokens y cache_read_input_tokens",
    "Reconocer que pause_turn no es un error sino una invitación a reenviar y continuar",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Enviar la petición es la mitad del trabajo; leer bien la respuesta es la otra mitad. La Messages API devuelve un objeto Message con una forma estable que conviene conocer campo a campo, porque de ahí sale tanto el contenido que muestras al usuario como las señales que gobiernan tu lógica de control y tu facturación.",
    },
    { type: "heading", level: 2, text: "El objeto Message" },
    {
      type: "list",
      items: [
        "type: siempre \"message\".",
        "id: identificador del mensaje.",
        "role: siempre \"assistant\".",
        "model: el modelo que respondió.",
        "content: array de bloques de contenido de la respuesta.",
        "stop_reason: por qué se detuvo la generación.",
        "stop_sequence: qué secuencia de parada personalizada se generó, si alguna.",
        "usage: el consumo de tokens para facturación y límites de tasa.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Messages API", icon: "concept-mensajes" },
        { service: "Errores y rate limits", icon: "concept-errores" },
        { service: "Caché de prompts", icon: "concept-cache" },
      ],
    },
    {
      type: "code",
      lang: "json",
      title: "Objeto Message de respuesta",
      code:
        "{\n" +
        "  \"type\": \"message\",\n" +
        "  \"id\": \"msg_01XFDUDYJgAACzvnptvVoYEL\",\n" +
        "  \"role\": \"assistant\",\n" +
        "  \"model\": \"claude-sonnet-5\",\n" +
        "  \"content\": [\n" +
        "    { \"type\": \"text\", \"text\": \"Hola. ¿En qué puedo ayudarte?\" }\n" +
        "  ],\n" +
        "  \"stop_reason\": \"end_turn\",\n" +
        "  \"stop_sequence\": null,\n" +
        "  \"usage\": {\n" +
        "    \"input_tokens\": 12,\n" +
        "    \"output_tokens\": 9,\n" +
        "    \"cache_creation_input_tokens\": 0,\n" +
        "    \"cache_read_input_tokens\": 0\n" +
        "  }\n" +
        "}",
      highlightLines: [9, 12],
    },
    { type: "heading", level: 2, text: "stop_reason: los siete valores" },
    {
      type: "paragraph",
      text:
        "stop_reason explica por qué se detuvo la generación. En modo no-streaming nunca es null; en streaming es null en message_start y no-null después. Hay siete valores, y tres de ellos son modernos y rompen clientes antiguos.",
    },
    {
      type: "list",
      items: [
        "end_turn: el modelo llegó a un punto de parada natural.",
        "max_tokens: se superó el max_tokens pedido o el máximo del modelo.",
        "stop_sequence: se generó una de tus secuencias de parada personalizadas.",
        "tool_use: el modelo invocó una o más herramientas.",
        "pause_turn: se pausó un turno de larga duración; puedes devolver la respuesta tal cual para que continúe.",
        "refusal: los clasificadores intervinieron ante una posible violación de política.",
        "model_context_window_exceeded: se superó la ventana de contexto del modelo.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "pause_turn NO es un error: es una invitación a reenviar la respuesta tal cual en una petición posterior para que el modelo continúe. refusal y model_context_window_exceeded también son valores que un cliente escrito contra generaciones anteriores no espera. Si tu switch de stop_reason lanza en el default, estos tres lo romperán.",
    },
    { type: "heading", level: 2, text: "usage: el consumo real" },
    {
      type: "paragraph",
      text:
        "El objeto usage reporta el consumo de tokens. Hay un detalle que mucha gente calcula mal: el total de tokens de entrada es la SUMA de input_tokens, cache_creation_input_tokens y cache_read_input_tokens. No están incluidos unos en otros, así que mirar solo input_tokens subestima el consumo cuando hay caché.",
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Dos advertencias de la documentación: los conteos no se corresponden uno a uno con el contenido visible (la API transforma la petición a un formato apto para el modelo), y output_tokens es distinto de cero incluso para una respuesta de cadena vacía.",
    },
    {
      type: "code",
      lang: "python",
      title: "Leer stop_reason y calcular el total de entrada",
      code:
        "msg = client.messages.create(\n" +
        "    model=\"claude-sonnet-5\", max_tokens=512,\n" +
        "    messages=[{\"role\": \"user\", \"content\": \"Hola\"}],\n" +
        ")\n" +
        "\n" +
        "texto = msg.content[0].text\n" +
        "u = msg.usage\n" +
        "entrada_total = (\n" +
        "    u.input_tokens\n" +
        "    + (u.cache_creation_input_tokens or 0)\n" +
        "    + (u.cache_read_input_tokens or 0)\n" +
        ")\n" +
        "print(msg.stop_reason, entrada_total, u.output_tokens)",
      highlightLines: [8, 9, 10, 11],
    },
    {
      type: "checklist",
      title: "Checklist al consumir la respuesta",
      items: [
        "Leo el texto desde content, no asumo un único bloque fijo.",
        "Manejo los siete valores de stop_reason, con un default tolerante.",
        "Trato pause_turn como continuación, no como error.",
        "Sumo los tres campos de entrada de usage para el total real.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Cómo se calcula el total de tokens de entrada a partir del objeto usage?",
      options: [
        "Solo con input_tokens; el resto ya está incluido en él",
        "Sumando input_tokens, cache_creation_input_tokens y cache_read_input_tokens, que no se incluyen unos en otros",
        "Restando cache_read_input_tokens de output_tokens",
        "Es siempre igual a output_tokens",
      ],
      correctIndex: 1,
      explanation:
        "El total de entrada es la suma de input_tokens, cache_creation_input_tokens y cache_read_input_tokens. No están anidados unos en otros, así que mirar solo input_tokens subestima el consumo cuando hay caché de prompts.",
    },
    {
      question: "Recibes una respuesta con stop_reason \"pause_turn\". ¿Qué representa?",
      options: [
        "Un error que debe reintentarse cambiando el payload",
        "El fin definitivo de la conversación",
        "Un turno de larga duración que se pausó; puedes reenviar la respuesta tal cual para que el modelo continúe",
        "Que se agotó tu límite de tasa",
      ],
      correctIndex: 2,
      explanation:
        "pause_turn indica que un turno largo se pausó. No es un error: devuelves la respuesta tal cual en una petición posterior y el modelo continúa. Es uno de los tres valores (con refusal y model_context_window_exceeded) que rompen clientes antiguos que no los esperan.",
    },
    {
      question: "Sobre output_tokens en el objeto usage, ¿qué afirmación es correcta?",
      options: [
        "Es siempre 0 si la respuesta es una cadena vacía",
        "Es distinto de cero incluso para una respuesta de cadena vacía",
        "Coincide exactamente con el número de caracteres visibles de la respuesta",
        "Solo aparece en respuestas en streaming",
      ],
      correctIndex: 1,
      explanation:
        "La documentación advierte que output_tokens es distinto de cero incluso para una respuesta de cadena vacía, y que los conteos no se corresponden uno a uno con el contenido visible porque la API transforma la petición y parsea la salida.",
    },
  ],
};
