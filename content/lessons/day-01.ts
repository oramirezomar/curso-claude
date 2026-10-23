import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 13.1). Fuente de verdad técnica:
// docs-referencia/claude/claude-reference-claude-com.md (§1 Modelos y Precios,
// §2 Ciclo de vida) y claude-messages-detail.md. Terminología oficial de la
// Claude Developer Platform. Req 3.1, 9.1–9.5.
export const day01: Lesson = {
  day: 1,
  slug: "modelos-y-precios",
  title: "Modelos y precios",
  section: "BÁSICO",
  estimatedMinutes: 22,
  icon: "concept-modelos",
  objectives: [
    "Reconocer el lineup actual de modelos de la Claude Developer Platform (Fable 5.1, Opus 5, Sonnet 5, Haiku 4.5) y para qué está pensado cada uno",
    "Leer el precio por millón de tokens (MTok) de entrada y de salida, y estimar el coste de una petición",
    "Distinguir la ventana de contexto y la salida máxima de cada modelo",
    "Elegir el ID de modelo correcto entendiendo la diferencia entre un snapshot fijado y un alias de conveniencia",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Antes de escribir una sola llamada a la API necesitas decidir qué modelo de Claude vas a usar. Esa decisión no es cosmética: determina el coste por token, la latencia, el tamaño de la ventana de contexto y hasta qué punto el modelo puede razonar sobre problemas difíciles. La Claude Developer Platform publica un lineup acotado de modelos vigentes, cada uno pensado para un perfil de carga distinto.",
    },
    { type: "heading", level: 2, text: "El lineup actual" },
    {
      type: "paragraph",
      text:
        "Todos los modelos vigentes aceptan entrada de texto e imagen, producen texto, son multilingües y soportan visión y uso de herramientas. Lo que cambia entre ellos es la combinación de inteligencia, velocidad y precio. Estos son los cuatro modelos de referencia del lineup actual:",
    },
    {
      type: "list",
      items: [
        "Claude Fable 5.1 — razonamiento exigente y trabajo agéntico de horizonte largo. Es el más lento y el más caro: $10 / MTok de entrada y $50 / MTok de salida.",
        "Claude Opus 5 — codificación agéntica compleja y trabajo empresarial. El punto de partida recomendado para la mayoría de cargas: $5 / MTok de entrada y $25 / MTok de salida.",
        "Claude Sonnet 5 — la mejor combinación de velocidad e inteligencia: $2 / MTok de entrada y $10 / MTok de salida.",
        "Claude Haiku 4.5 — el más rápido, con inteligencia cercana a la frontera: $1 / MTok de entrada y $5 / MTok de salida.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Modelos y precios", icon: "concept-modelos" },
        { service: "Ciclo de vida de modelos", icon: "concept-ciclo-vida" },
        { service: "Messages API", icon: "concept-mensajes" },
      ],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "La recomendación de la propia documentación: empieza por Claude Opus 5 para la mayoría de las cargas, y pasa a Claude Fable 5.1 cuando necesites razonamiento exigente, trabajo agéntico de horizonte largo, o cuando tus evaluaciones con Opus 5 a mayor esfuerzo se queden cortas.",
    },
    { type: "heading", level: 2, text: "Precio por millón de tokens (MTok)" },
    {
      type: "paragraph",
      text:
        "El precio se expresa por millón de tokens, y entrada y salida se facturan por separado. La salida siempre es varias veces más cara que la entrada, así que el coste real de una aplicación depende mucho de cuánto texto genera, no solo de cuánto le mandas. La tabla base por MTok es la siguiente:",
    },
    {
      type: "code",
      lang: "text",
      title: "Precio base por MTok (entrada / salida)",
      code:
        "Modelo             Entrada   Salida\n-----------------  -------   ------\nClaude Fable 5.1   $10       $50\nClaude Opus 5      $5        $25\nClaude Sonnet 5    $2        $10\nClaude Haiku 4.5   $1        $5",
    },
    {
      type: "paragraph",
      text:
        "Con esos números puedes estimar el coste de una petición concreta. Supón una llamada a Sonnet 5 con 12 000 tokens de entrada y 2 000 de salida: la entrada cuesta 12 000 / 1 000 000 × $2 = $0,024 y la salida 2 000 / 1 000 000 × $10 = $0,02, en total unos $0,044 por petición.",
    },
    {
      type: "callout",
      variant: "success",
      text:
        "Dos palancas de ahorro que verás en detalle más adelante: la Message Batches API aplica un 50 % de descuento sobre el precio base, y las lecturas de caché de prompt cuestan solo el 10 % del precio base de entrada (un 2,5 % en Fable 5.1 y Mythos 5.1).",
    },
    { type: "heading", level: 2, text: "Ventana de contexto y salida máxima" },
    {
      type: "paragraph",
      text:
        "La ventana de contexto es cuánto texto cabe en una sola petición (entrada más salida). La salida máxima es el techo de tokens que el modelo puede generar en la Messages API síncrona. No son lo mismo y conviene no confundirlos:",
    },
    {
      type: "list",
      items: [
        "Fable 5.1, Opus 5 y Sonnet 5: ventana de contexto de 1M tokens y salida máxima de 128K tokens.",
        "Haiku 4.5: ventana de contexto de 200K tokens y salida máxima de 64K tokens.",
        "Con el tokenizador actual (introducido con Claude Opus 4.7), 1M tokens equivalen aproximadamente a 555 000 palabras; 200K tokens, a unas 150 000 palabras.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Si quieres consultar capacidades y límites de tokens de forma programática en lugar de codificar la tabla en tu aplicación, usa la Models API (GET /v1/models): la respuesta incluye max_input_tokens, max_tokens y un objeto capabilities por modelo.",
    },
    { type: "heading", level: 2, text: "IDs de modelo: snapshot fijado frente a alias" },
    {
      type: "paragraph",
      text:
        "Para seleccionar un modelo envías su ID en el parámetro model de la Messages API. Aquí hay un matiz que evita sorpresas en producción: todo ID de modelo de la Claude API es un snapshot fijado, incluidos los IDs sin fecha que se usan desde la generación 4.6. Para modelos anteriores a la 4.6, el alias es un puntero de conveniencia que resuelve a un ID con fecha; el ID sin fecha es su propio snapshot.",
    },
    {
      type: "code",
      lang: "json",
      title: "IDs de modelo en la Claude API",
      code:
        "{\n  \"fable_5_1\": \"claude-fable-5-1\",\n  \"opus_5\": \"claude-opus-5\",\n  \"sonnet_5\": \"claude-sonnet-5\",\n  \"haiku_4_5_snapshot\": \"claude-haiku-4-5-20251001\",\n  \"haiku_4_5_alias\": \"claude-haiku-4-5\"\n}",
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Audita qué IDs usas en producción: un alias sin fecha de un modelo anterior a la 4.6 se mueve bajo tus pies cuando el modelo al que apunta cambia, mientras que un ID fijado con fecha no. El retiro de cada modelo se anuncia con una fecha de 'no antes de' (por ejemplo, Sonnet 5 no antes del 30 jun 2027), que el ciclo de vida cubre en la siguiente lección.",
    },
    {
      type: "paragraph",
      text:
        "Regla práctica para elegir modelo: parte del perfil de la tarea, no del precio. Si es trabajo agéntico largo o razonamiento profundo, Fable 5.1 u Opus 5. Si buscas el equilibrio entre velocidad e inteligencia para la mayoría de las peticiones interactivas, Sonnet 5. Si priorizas latencia y coste mínimo (clasificaciones, respuestas cortas, subagentes), Haiku 4.5. Y mide con tus propias evaluaciones antes de fijar la decisión.",
    },
  ],
  selfCheck: [
    {
      question:
        "Para una aplicación que prioriza la mejor combinación de velocidad e inteligencia con un coste contenido, ¿qué modelo del lineup actual encaja mejor?",
      options: [
        "Claude Fable 5.1, porque es el más potente",
        "Claude Sonnet 5, por su equilibrio de velocidad e inteligencia a $2/$10 por MTok",
        "Claude Haiku 4.5, porque es siempre la mejor opción",
        "Cualquiera, el modelo no afecta a la latencia ni al coste",
      ],
      correctIndex: 1,
      explanation:
        "Claude Sonnet 5 está posicionado como la mejor combinación de velocidad e inteligencia, con un precio de $2 / MTok de entrada y $10 / MTok de salida. Fable 5.1 es más potente pero más lento y caro; Haiku 4.5 prioriza velocidad y coste mínimo a costa de inteligencia.",
    },
    {
      question:
        "¿Cuál es la diferencia correcta entre un snapshot fijado y un alias en los IDs de modelo de la Claude API?",
      options: [
        "No hay diferencia: todos los IDs apuntan siempre al mismo modelo",
        "El alias es un snapshot fijado y el ID con fecha es el que se mueve",
        "Todo ID de la Claude API es un snapshot fijado; en modelos anteriores a la 4.6 el alias es un puntero de conveniencia que resuelve a un ID con fecha",
        "Los alias solo existen en Amazon Bedrock",
      ],
      correctIndex: 2,
      explanation:
        "Todo ID de modelo de la Claude API es un snapshot fijado, incluidos los IDs sin fecha desde la generación 4.6. En modelos anteriores a la 4.6, el alias es un puntero de conveniencia que resuelve a un ID con fecha; por eso conviene auditar qué IDs usas en producción.",
    },
    {
      question:
        "Una petición a Claude Opus 5 consume 20 000 tokens de entrada y 4 000 de salida. ¿Cuál es el coste aproximado?",
      options: [
        "$0,20 (20 000 × $10)",
        "$0,20 de entrada más $0,10 de salida ≈ $0,30",
        "Es gratis porque está por debajo de 1M tokens",
        "$5 de entrada más $25 de salida",
      ],
      correctIndex: 1,
      explanation:
        "El precio es por millón de tokens. Entrada: 20 000 / 1 000 000 × $5 = $0,10. Salida: 4 000 / 1 000 000 × $25 = $0,10. El total ronda $0,20; la salida pesa más por token aunque aquí haya menos tokens de salida.",
    },
  ],
};
