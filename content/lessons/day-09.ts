import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 14.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-messages-detail.md (§6 Caché de Prompts).
// Terminología oficial. Req 3.7.
export const day09: Lesson = {
  day: 9,
  slug: "cache-de-prompts",
  title: "Caché de prompts",
  section: "MEDIO",
  estimatedMinutes: 28,
  icon: "concept-cache",
  objectives: [
    "Marcar un punto de corte de caché con cache_control y entender los dos TTL (5m y 1h)",
    "Respetar la longitud mínima cacheable por modelo y verificar un acierto de caché leyendo usage",
    "Aplicar la jerarquía de invalidación tools → system → messages",
    "Estimar el ahorro: las lecturas de caché cuestan el 10% del precio base de entrada (2,5% en Fable 5.1)",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "La caché de prompts reutiliza el trabajo de procesar un prefijo estable de tu petición —un prompt de sistema largo, un documento de referencia, un conjunto de herramientas— en lugar de recalcularlo cada vez. Es una de las dos grandes palancas de ahorro de la plataforma, y bien usada reduce el coste de entrada drásticamente.",
    },
    { type: "heading", level: 2, text: "Cómo se marca" },
    {
      type: "paragraph",
      text:
        "Se declara un punto de corte con cache_control en un bloque. Todo lo que está desde el inicio de la petición hasta ese bloque forma el prefijo cacheable. El único tipo soportado es ephemeral, con un ttl por defecto de \"5m\" y opción de \"1h\".",
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Caché de prompts", icon: "concept-cache" },
        { service: "Messages API", icon: "concept-mensajes" },
        { service: "Batches y Files", icon: "concept-batches" },
      ],
    },
    {
      type: "code",
      lang: "json",
      title: "Punto de corte de caché en el prompt de sistema",
      code:
        "{\n" +
        "  \"model\": \"claude-sonnet-5\",\n" +
        "  \"max_tokens\": 1024,\n" +
        "  \"system\": [\n" +
        "    {\n" +
        "      \"type\": \"text\",\n" +
        "      \"text\": \"<instrucciones largas y estables + documentación de dominio>\",\n" +
        "      \"cache_control\": { \"type\": \"ephemeral\", \"ttl\": \"1h\" }\n" +
        "    }\n" +
        "  ],\n" +
        "  \"messages\": [{ \"role\": \"user\", \"content\": \"Pregunta del usuario\" }]\n" +
        "}",
      highlightLines: [8],
    },
    { type: "heading", level: 2, text: "La longitud mínima cacheable" },
    {
      type: "paragraph",
      text:
        "Este es el dato que más problemas causa, porque un prompt más corto que el mínimo no se cachea y NO se devuelve error. El mínimo depende del modelo: 512 tokens en Fable 5.1, Mythos 5.1 y Opus 5; 1 024 en Sonnet 5, Opus 4.8 y varios más; 2 048 o 4 096 en otros. Haiku 4.5 exige 4 096.",
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Cómo verificar si se cacheó: revisa usage. Si cache_creation_input_tokens y cache_read_input_tokens son ambos 0, no se cacheó, probablemente por no alcanzar el mínimo. Si tu prompt se queda justo por debajo del umbral, suele valer la pena ampliar el contenido cacheado para alcanzarlo.",
    },
    { type: "heading", level: 2, text: "Jerarquía de invalidación" },
    {
      type: "paragraph",
      text:
        "La caché sigue el orden tools → system → messages. Un cambio en un nivel invalida ese nivel y todos los posteriores. Cambiar una definición de herramienta invalida los tres; cambiar tool_choice invalida system y messages; añadir o quitar imágenes invalida solo messages.",
    },
    {
      type: "code",
      lang: "text",
      title: "Qué invalida qué (✘ = se invalida)",
      code:
        "Cambio                              tools  system  messages\n" +
        "----------------------------------  -----  ------  --------\n" +
        "Definiciones de herramientas         ✘      ✘        ✘\n" +
        "Activar/desactivar web search        -      ✘        ✘\n" +
        "tool_choice                          -      -        ✘\n" +
        "Añadir/quitar imágenes               -      -        ✘",
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Los parámetros de thinking y de effort \"dependen del modelo\" porque se renderizan dentro del prompt: cambiarlos siempre invalida los bloques de mensaje, y también las cachés de herramientas y de sistema en los modelos que renderizan esa configuración antes de ellas. Fijar effort a su valor por defecto, en cambio, no invalida nada.",
    },
    { type: "heading", level: 2, text: "El ahorro" },
    {
      type: "list",
      items: [
        "Escritura de caché 5m: 1,25× el precio base de entrada.",
        "Escritura de caché 1h: 2× el precio base de entrada.",
        "Lectura y refresco de caché: 10% del precio base de entrada.",
        "Lectura en Fable 5.1 y Mythos 5.1: 2,5% del precio base de entrada.",
      ],
    },
    {
      type: "callout",
      variant: "success",
      text:
        "Con batches, que pueden tardar más de 5 minutos, usa la caché de 1 hora para mejores tasas de acierto cuando el contexto es compartido. Y ojo con las peticiones concurrentes: una entrada de caché solo está disponible después de que empiece la primera respuesta, así que para aciertos en paralelo hay que esperar la primera antes de disparar las demás.",
    },
    {
      type: "checklist",
      title: "Checklist de caché de prompts",
      items: [
        "El prefijo cacheable supera la longitud mínima del modelo que uso.",
        "Verifico el acierto leyendo cache_read_input_tokens en usage.",
        "Ordeno lo estable al inicio (tools, system) para no invalidar con cambios de messages.",
        "Elijo ttl 1h cuando el contexto se comparte en batches o ventanas largas.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "Tu prompt de sistema lleva cache_control pero usage muestra cache_creation_input_tokens y cache_read_input_tokens ambos en 0. ¿Causa más probable?",
      options: [
        "La API devolvió un error que ignoraste",
        "El prefijo no alcanza la longitud mínima cacheable del modelo, y un prompt corto no se cachea sin devolver error",
        "La caché solo funciona con x-api-key",
        "El modelo no soporta caché de prompts",
      ],
      correctIndex: 1,
      explanation:
        "Un prompt más corto que el mínimo cacheable del modelo no se cachea y no devuelve error. El mínimo varía (512, 1024, 2048 o 4096 tokens según el modelo). Si ambos campos de caché en usage son 0, lo más probable es no haber alcanzado el umbral.",
    },
    {
      question: "Según la jerarquía de invalidación, ¿qué invalida cambiar una definición de herramienta (tools)?",
      options: [
        "Solo la caché de messages",
        "Nada: tools no participa en la caché",
        "Los tres niveles: tools, system y messages",
        "Solo la caché de system",
      ],
      correctIndex: 2,
      explanation:
        "La caché sigue el orden tools → system → messages, y un cambio invalida ese nivel y todos los posteriores. Como tools es el primero, cambiar una definición de herramienta invalida los tres niveles. Por eso conviene mantener las herramientas estables.",
    },
    {
      question: "¿Cuánto cuesta una lectura de caché frente al precio base de entrada en la mayoría de modelos?",
      options: [
        "El 100%: no hay ahorro",
        "El 50%, igual que los batches",
        "El 10% del precio base de entrada (2,5% en Fable 5.1 y Mythos 5.1)",
        "El 200%, porque leer es más caro que procesar",
      ],
      correctIndex: 2,
      explanation:
        "Las lecturas y refrescos de caché cuestan el 10% del precio base de entrada, y solo el 2,5% en Fable 5.1 y Mythos 5.1. Las escrituras cuestan 1,25× (5m) o 2× (1h). Ese 10% es la razón por la que ampliar un prompt para alcanzar el mínimo suele compensar.",
    },
  ],
};
