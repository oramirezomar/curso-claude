import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 13.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-reference-claude-com.md (§3 Versionado de la
// API, §4 Autenticación y Cabeceras). Terminología oficial. Req 3.3.
export const day03: Lesson = {
  day: 3,
  slug: "autenticacion-y-versionado",
  title: "Autenticación y versionado",
  section: "BÁSICO",
  estimatedMinutes: 20,
  icon: "concept-auth",
  objectives: [
    "Autenticar una petición con Authorization: Bearer <token> y reconocer x-api-key como alternativa legacy",
    "Enviar la cabecera obligatoria anthropic-version y entender qué garantiza el contrato de versión",
    "Anticipar que la API puede añadir variantes de enum nuevas y escribir código tolerante a valores desconocidos",
    "Situar el papel de los workspaces y la cabecera anthropic-workspace-id",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Toda petición a la Claude API —REST sobre https://api.anthropic.com— lleva un pequeño conjunto de cabeceras que la autentican y la anclan a una versión del contrato. Los SDKs las ponen por ti, pero conviene entenderlas porque determinan cómo evoluciona tu integración sin romperse.",
    },
    { type: "heading", level: 2, text: "Autenticación: Bearer es la vía vigente" },
    {
      type: "paragraph",
      text:
        "La forma recomendada de autenticar es la cabecera Authorization con un token Bearer. El token puede ser tu clave de API de la Console o un token de acceso de vida corta obtenido vía Workload Identity Federation. La cabecera x-api-key sigue soportada como alternativa legacy, pero no es la vía preferida para integraciones nuevas.",
    },
    {
      type: "list",
      items: [
        "Authorization: Bearer <token> — vía vigente. El token es tu clave de API o un token de acceso corto de WIF.",
        "x-api-key: <clave> — alternativa legacy, todavía soportada.",
        "anthropic-version — obligatoria siempre, por ejemplo 2023-06-01.",
        "content-type: application/json — obligatoria.",
        "anthropic-workspace-id — obligatoria solo con una clave multi-workspace; opcional con otras.",
        "anthropic-beta — solo al activar una feature beta.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Autenticación y versionado", icon: "concept-auth" },
        { service: "Messages API", icon: "concept-mensajes" },
        { service: "Workload Identity Federation", icon: "concept-identidad" },
      ],
    },
    {
      type: "code",
      lang: "bash",
      title: "Cabeceras de una petición autenticada",
      code:
        "curl https://api.anthropic.com/v1/messages \\\n" +
        "  -H \"Authorization: Bearer $ANTHROPIC_API_KEY\" \\\n" +
        "  -H \"anthropic-version: 2023-06-01\" \\\n" +
        "  -H \"content-type: application/json\" \\\n" +
        "  -d '{ \"model\": \"claude-sonnet-5\", \"max_tokens\": 256,\n" +
        "        \"messages\": [{ \"role\": \"user\", \"content\": \"Hola\" }] }'",
      highlightLines: [2, 3],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Los SDKs envían automáticamente autenticación, versión y content-type. La anthropic-workspace-id la pasas tú cuando tu clave lo necesita; no se usa con tokens de Workload Identity Federation, que seleccionan el workspace en el intercambio del token.",
    },
    { type: "heading", level: 2, text: "Versionado: la cabecera anthropic-version" },
    {
      type: "paragraph",
      text:
        "Anthropic no publica URLs versionadas de documentación: platform.claude.com/docs refleja siempre el estado actual. El versionado vive en la cabecera anthropic-version y en los IDs de modelo fijados. La versión vigente de referencia es 2023-06-01, que introdujo el formato de eventos SSE incrementales y eventos nombrados.",
    },
    {
      type: "paragraph",
      text:
        "Para una versión dada de la Messages API, Anthropic preserva los parámetros de entrada y salida existentes. Pero el contrato permite explícitamente añadir cosas: entradas opcionales nuevas, valores nuevos en la salida, cambios en las condiciones de tipos de error, y —la que más rompe integraciones— variantes nuevas a valores tipo enum, como tipos de evento de streaming o valores de stop_reason.",
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Esta es la trampa clásica: tu código debe tolerar valores de enum que no conoce. Si manejas stop_reason o tipos de evento SSE con un switch exhaustivo que lanza en el default, una variante nueva (por ejemplo pause_turn) romperá tu integración aunque tu versión no cambie. Maneja el caso desconocido con elegancia.",
    },
    {
      type: "code",
      lang: "ts",
      title: "Tolerar valores de enum desconocidos",
      code:
        "switch (resp.stop_reason) {\n" +
        "  case \"end_turn\":\n" +
        "  case \"stop_sequence\":\n" +
        "    return mostrarTexto(resp);\n" +
        "  case \"tool_use\":\n" +
        "    return ejecutarHerramientas(resp);\n" +
        "  default:\n" +
        "    // pause_turn, refusal u otros valores futuros:\n" +
        "    // NO lanzar. Degradar con elegancia.\n" +
        "    return manejarDesconocido(resp);\n" +
        "}",
      highlightLines: [6, 7, 8, 9],
    },
    { type: "heading", level: 2, text: "Workspaces y claves" },
    {
      type: "paragraph",
      text:
        "Necesitas una cuenta de Console y, o bien una clave de API, o bien una regla de Workload Identity Federation configurada. Al crear una clave eliges su tipo y su expiración. Los workspaces sirven para separar entornos y controlar el gasto por caso de uso; cuando una clave abarca varios, la cabecera anthropic-workspace-id indica en cuál corre la petición.",
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Anthropic recomienda usar siempre la versión más reciente. Las versiones anteriores se consideran deprecadas y pueden no estar disponibles para usuarios nuevos.",
    },
  ],
  selfCheck: [
    {
      question: "¿Cuál es la vía de autenticación vigente y cuál la legacy en la Claude API?",
      options: [
        "x-api-key es la vigente; Authorization: Bearer es legacy",
        "Authorization: Bearer <token> es la vigente; x-api-key es la alternativa legacy todavía soportada",
        "Ambas están deprecadas; solo funciona OAuth",
        "No hace falta autenticación para la Messages API",
      ],
      correctIndex: 1,
      explanation:
        "La vía vigente es Authorization: Bearer <token>, donde el token es tu clave de API o un token corto de Workload Identity Federation. x-api-key sigue soportada pero es la alternativa legacy, no la recomendada para integraciones nuevas.",
    },
    {
      question:
        "Según el contrato de versionado, ¿qué cambio PUEDE introducir la API sin cambiar tu versión, y que tu código debe tolerar?",
      options: [
        "Eliminar parámetros de entrada existentes sin aviso",
        "Añadir variantes nuevas a valores tipo enum, como tipos de evento SSE o valores de stop_reason",
        "Cambiar el significado de un parámetro existente",
        "Requerir una cabeza de autenticación distinta cada semana",
      ],
      correctIndex: 1,
      explanation:
        "El contrato preserva los parámetros existentes, pero permite añadir entradas opcionales, valores nuevos en la salida y variantes nuevas de enum (tipos de evento, stop_reason). Por eso tu código debe manejar con elegancia los valores que no conoce en lugar de lanzar.",
    },
    {
      question: "¿Qué cabecera es obligatoria en TODA petición, incluso usando un SDK que la pone por ti?",
      options: [
        "anthropic-beta",
        "anthropic-workspace-id",
        "anthropic-version",
        "retry-after",
      ],
      correctIndex: 2,
      explanation:
        "anthropic-version es obligatoria en toda petición (los SDKs la envían por ti). anthropic-beta solo se usa para activar features beta, anthropic-workspace-id solo cuando la clave abarca varios workspaces, y retry-after es una cabecera de respuesta, no de petición.",
    },
  ],
};
