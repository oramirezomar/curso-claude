import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 14.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-reference-claude-com.md (§8 Límites de Tasa,
// §9 Errores). Terminología oficial. Req 3.23.
export const day17: Lesson = {
  day: 17,
  slug: "errores-y-rate-limits",
  title: "Errores y rate limits",
  section: "MEDIO",
  estimatedMinutes: 28,
  icon: "concept-errores",
  objectives: [
    "Mapear los códigos HTTP a tipos de error de la API (400, 401, 403, 429, 500, 529)",
    "Aplicar backoff exponencial y respetar la cabecera retry-after ante un 429",
    "Leer las cabeceras anthropic-ratelimit-* para anticiparte a los límites",
    "Manejar el caso trampa: un error que llega como evento SSE después de un HTTP 200 en streaming",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Una integración seria se define por cómo maneja los fallos, no por el camino feliz. La Claude API usa códigos HTTP estándar con tipos de error nombrados, y tiene un sistema de límites de tasa con cabeceras que te dejan anticiparte. Conocerlos evita caídas en producción y gasto desperdiciado en reintentos mal hechos.",
    },
    { type: "heading", level: 2, text: "Códigos y tipos de error" },
    {
      type: "code",
      lang: "text",
      title: "Códigos HTTP y su tipo de error",
      code:
        "400  invalid_request_error     Formato o contenido de la petición.\n" +
        "401  authentication_error      Clave mal formada, revocada o expirada.\n" +
        "403  permission_error          La clave no tiene permiso sobre el recurso.\n" +
        "404  not_found_error           Recurso no encontrado.\n" +
        "409  conflict_error            Choque con el estado actual del recurso.\n" +
        "413  request_too_large         Se excedió el máximo de bytes.\n" +
        "429  rate_limit_error          Límite de tasa o tope de gasto.\n" +
        "500  api_error                 Error interno inesperado.\n" +
        "529  overloaded_error          API temporalmente sobrecargada.",
      highlightLines: [7, 9],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Errores y rate limits", icon: "concept-errores" },
        { service: "Streaming SSE", icon: "concept-streaming" },
        { service: "Admin API", icon: "concept-admin" },
      ],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Los SDKs oficiales reintentan automáticamente los fallos transitorios (conexión, límites de tasa, 5xx) con backoff exponencial, dos veces por defecto, respetando retry-after cuando está presente. Si implementas el cliente a mano, tienes que replicar ese comportamiento.",
    },
    { type: "heading", level: 2, text: "Límites de tasa y sus cabeceras" },
    {
      type: "paragraph",
      text:
        "Ante un 429 por límite de tasa, la respuesta trae retry-after con los segundos a esperar; reintentar antes falla. Además, cada respuesta trae cabeceras que informan de tu presupuesto restante, para que te anticipes sin llegar a tropezar con el límite.",
    },
    {
      type: "list",
      items: [
        "retry-after: segundos a esperar antes de reintentar. No se envía con el 429 de tope de gasto.",
        "anthropic-ratelimit-requests-remaining: peticiones restantes antes de ser limitado.",
        "anthropic-ratelimit-tokens-remaining: tokens restantes, redondeados al millar más próximo.",
        "anthropic-ratelimit-*-reset: momento de reposición del límite, en RFC 3339.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Dos matices operativos: un 429 por tope de gasto de nivel NO incluye retry-after (esperar no lo resuelve; es distinto de un 429 por límite de tasa). Y existen límites de aceleración: si tu organización sube el tráfico de golpe, puedes recibir 429 aunque no hayas alcanzado tu límite nominal. La recomendación es escalar el tráfico de forma gradual.",
    },
    {
      type: "code",
      lang: "python",
      title: "Backoff exponencial respetando retry-after",
      code:
        "import time\n" +
        "from anthropic import Anthropic, RateLimitError, APIError\n" +
        "\n" +
        "client = Anthropic()\n" +
        "\n" +
        "def enviar_con_reintentos(payload, intentos=5):\n" +
        "    espera = 1.0\n" +
        "    for n in range(intentos):\n" +
        "        try:\n" +
        "            return client.messages.create(**payload)\n" +
        "        except RateLimitError as e:\n" +
        "            retry_after = e.response.headers.get(\"retry-after\")\n" +
        "            time.sleep(float(retry_after) if retry_after else espera)\n" +
        "            espera *= 2  # backoff exponencial\n" +
        "        except APIError:\n" +
        "            time.sleep(espera)\n" +
        "            espera *= 2\n" +
        "    raise RuntimeError(\"Agotados los reintentos\")",
      highlightLines: [12, 13, 14],
    },
    { type: "heading", level: 2, text: "La trampa del streaming" },
    {
      type: "callout",
      variant: "warning",
      text:
        "En streaming, un error puede ocurrir DESPUÉS de que la API haya devuelto un 200. No sigue los mecanismos estándar: el error llega como un evento SSE de tipo error dentro del flujo (por ejemplo overloaded_error). Es la trampa clásica de las integraciones que comprueban el status HTTP inicial y dan la respuesta por buena.",
    },
    {
      type: "code",
      lang: "text",
      title: "Error recibido a mitad del flujo SSE",
      code:
        "event: error\n" +
        "data: {\"type\":\"error\",\"error\":{\"type\":\"overloaded_error\",\"message\":\"Overloaded\"}}",
      highlightLines: [1, 2],
    },
    {
      type: "checklist",
      title: "Checklist de errores y rate limits",
      items: [
        "Distingo 429 por límite de tasa (reintentar con retry-after) de 429 por tope de gasto (esperar no sirve).",
        "Aplico backoff exponencial y respeto retry-after.",
        "Leo las cabeceras anthropic-ratelimit-* para anticiparme al límite.",
        "Escalo el tráfico gradualmente para no disparar los límites de aceleración.",
        "En streaming, capturo el evento error aunque el HTTP inicial fuera 200.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "Recibes un HTTP 529 (overloaded_error). ¿Qué representa y cómo reaccionar?",
      options: [
        "Un error de tu payload; corrígelo y reenvía sin esperar",
        "Una sobrecarga temporal de la API por tráfico alto de todos los usuarios; reintenta con backoff exponencial",
        "Que tu clave expiró; crea una nueva",
        "Que superaste el tamaño máximo de petición",
      ],
      correctIndex: 1,
      explanation:
        "El 529 overloaded_error indica que la API está temporalmente sobrecargada por tráfico alto de todos los usuarios. No es un problema de tu petición: lo correcto es reintentar con backoff exponencial. El 401 es clave expirada y el 413 es tamaño excedido.",
    },
    {
      question: "¿Qué diferencia hay entre un 429 por límite de tasa y un 429 por tope de gasto de nivel?",
      options: [
        "Ninguna; ambos se resuelven esperando lo que diga retry-after",
        "El 429 por límite de tasa trae retry-after (esperar sirve); el 429 por tope de gasto NO lo trae, porque esperar no lo resuelve",
        "El de tope de gasto trae retry-after y el de límite de tasa no",
        "El de tope de gasto es en realidad un 500",
      ],
      correctIndex: 1,
      explanation:
        "Un 429 por límite de tasa incluye retry-after: esperar los segundos indicados resuelve el problema. Un 429 por tope de gasto de nivel NO incluye retry-after, porque esperar no lo resuelve: hay que ajustar el gasto o el límite.",
    },
    {
      question: "¿Por qué es peligroso, en streaming, dar la respuesta por buena solo porque el HTTP inicial fue 200?",
      options: [
        "Porque el 200 en streaming siempre es falso",
        "Porque un error puede llegar DESPUÉS del 200, como un evento SSE de tipo error (p. ej. overloaded_error) a mitad del flujo",
        "Porque el streaming no devuelve códigos HTTP",
        "Porque el 200 en streaming significa error",
      ],
      correctIndex: 1,
      explanation:
        "En streaming, la API puede devolver un 200 y luego emitir un evento error dentro del flujo SSE (por ejemplo overloaded_error). Comprobar solo el status HTTP inicial deja pasar esos errores: hay que manejar también el evento error a mitad del flujo.",
    },
  ],
};
