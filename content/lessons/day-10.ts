import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 14.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-messages-detail.md (§8 Message Batches, §9
// Files API). Terminología oficial. Req 3.8.
export const day10: Lesson = {
  day: 10,
  slug: "batches-y-files",
  title: "Batches y Files",
  section: "MEDIO",
  estimatedMinutes: 26,
  icon: "concept-batches",
  objectives: [
    "Procesar grandes volúmenes de peticiones de forma asíncrona con la Message Batches API al 50% del precio",
    "Conocer los límites y el ciclo de un batch: estados, expiración a 24h y retención de resultados 29 días",
    "Subir archivos reutilizables con la Files API y referenciarlos desde bloques document, image o container_upload",
    "Entender por qué Batches y Files no son elegibles para Zero Data Retention",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "No todo el trabajo necesita respuesta inmediata. Para volúmenes grandes de peticiones independientes —clasificar miles de documentos, generar descripciones de un catálogo— la Message Batches API procesa de forma asíncrona con un 50% de descuento. Y para contenido que reutilizas entre llamadas, la Files API evita reenviarlo cada vez.",
    },
    { type: "heading", level: 2, text: "Message Batches API" },
    {
      type: "paragraph",
      text:
        "Envías un array de requests, donde cada entrada es una petición de creación de mensaje individual. Todo el uso se factura al 50% de los precios estándar. Es el camino cuando la latencia no importa y el volumen sí.",
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Batches y Files", icon: "concept-batches" },
        { service: "Caché de prompts", icon: "concept-cache" },
        { service: "Zero Data Retention", icon: "concept-seguridad" },
      ],
    },
    {
      type: "code",
      lang: "bash",
      title: "Crear un batch con dos peticiones",
      code:
        "curl https://api.anthropic.com/v1/messages/batches \\\n" +
        "  -H \"Authorization: Bearer $ANTHROPIC_API_KEY\" \\\n" +
        "  -H \"anthropic-version: 2023-06-01\" \\\n" +
        "  -H \"content-type: application/json\" \\\n" +
        "  -d '{\n" +
        "    \"requests\": [\n" +
        "      { \"custom_id\": \"doc-1\", \"params\": {\n" +
        "          \"model\": \"claude-haiku-4-5\", \"max_tokens\": 256,\n" +
        "          \"messages\": [{ \"role\": \"user\", \"content\": \"Clasifica: ...\" }] } },\n" +
        "      { \"custom_id\": \"doc-2\", \"params\": {\n" +
        "          \"model\": \"claude-haiku-4-5\", \"max_tokens\": 256,\n" +
        "          \"messages\": [{ \"role\": \"user\", \"content\": \"Clasifica: ...\" }] } }\n" +
        "    ]\n" +
        "  }'",
    },
    {
      type: "list",
      items: [
        "Tamaño: hasta 100 000 peticiones o 256 MB, lo que se alcance primero.",
        "processing_status: in_progress, canceling, ended.",
        "Tiempo: la mayoría terminan en menos de 1 hora; expiran si no acaban en 24 horas.",
        "Resultados: descargables durante 29 días desde la creación.",
        "Ámbito: los batches pertenecen a un workspace.",
        "max_tokens: cada petición necesita al menos 1 (max_tokens 0 no está soportado en batch).",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "max_tokens 0 (pre-calentamiento de caché) no se soporta dentro de un batch: una entrada de caché efímera escrita durante el proceso probablemente expiraría antes de que corra la petición de seguimiento. Si usas caché con batches, usa el TTL de 1 hora para mejorar las tasas de acierto.",
    },
    { type: "heading", level: 2, text: "Files API" },
    {
      type: "paragraph",
      text:
        "La Files API te deja subir un archivo una vez y reutilizarlo entre llamadas, sin reenviar el contenido en cada petición. El tamaño máximo por archivo es de 500 MB. Cada tipo de archivo se referencia desde un tipo de bloque: document para PDFs y texto, image para imágenes, container_upload para el contenedor de ejecución de código.",
    },
    {
      type: "code",
      lang: "python",
      title: "Subir un archivo y referenciarlo en una petición",
      code:
        "subido = client.files.upload(\n" +
        "    file=(\"informe.pdf\", open(\"informe.pdf\", \"rb\"), \"application/pdf\"),\n" +
        ")\n" +
        "\n" +
        "msg = client.messages.create(\n" +
        "    model=\"claude-opus-5\", max_tokens=1024,\n" +
        "    messages=[{\n" +
        "        \"role\": \"user\",\n" +
        "        \"content\": [\n" +
        "            { \"type\": \"text\", \"text\": \"Resume el informe.\" },\n" +
        "            { \"type\": \"document\",\n" +
        "              \"source\": { \"type\": \"file\", \"file_id\": subido.id } },\n" +
        "        ],\n" +
        "    }],\n" +
        ")",
      highlightLines: [1, 12],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Ciclo de vida de los archivos: persisten hasta que los borras con DELETE /v1/files/{file_id} o hasta su expires_at. Tras expirar siguen apareciendo en el listado durante 30 días; para filtrarlos hay que comparar expires_at con el momento actual, porque la API no los oculta por ti.",
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Ni la Message Batches API ni la Files API son elegibles para Zero Data Retention. El motivo es el mismo patrón: ambas persisten datos fuera del turno de la petición (resultados descargables durante días, archivos reutilizables entre llamadas). En un entorno con ZDR estricto, esa columna manda.",
    },
    {
      type: "checklist",
      title: "Checklist de batches y files",
      items: [
        "Uso batches cuando la latencia no importa y el volumen sí (50% de ahorro).",
        "Cada petición del batch lleva max_tokens de al menos 1.",
        "Descargo los resultados dentro de la ventana de 29 días.",
        "Borro los archivos que ya no reutilizo y filtro expirados por expires_at.",
        "Si el requisito es ZDR, descarto Batches y Files.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Cuál es el beneficio económico principal de la Message Batches API y su contrapartida?",
      options: [
        "Respuesta más rápida, a cambio de un recargo del 50%",
        "Un 50% de descuento sobre el precio base, a cambio de procesamiento asíncrono (no inmediato)",
        "Gratis total, sin límites",
        "Un 10% de descuento solo en Haiku",
      ],
      correctIndex: 1,
      explanation:
        "Los batches se facturan al 50% de los precios estándar, a cambio de ser asíncronos: la mayoría terminan en menos de 1 hora y expiran si no acaban en 24h. Es la opción cuando la latencia no importa y el volumen sí.",
    },
    {
      question: "¿Durante cuánto tiempo son descargables los resultados de un batch desde su creación?",
      options: [
        "1 hora",
        "24 horas",
        "29 días",
        "Indefinidamente",
      ],
      correctIndex: 2,
      explanation:
        "Los resultados son descargables durante 29 días desde la creación del batch. El batch expira si no termina en 24 horas, pero una vez terminado, sus resultados quedan disponibles para descarga durante esa ventana de 29 días. Esa retención es también la razón por la que Batches no es elegible para ZDR.",
    },
    {
      question: "¿Por qué la Files API no es elegible para Zero Data Retention?",
      options: [
        "Porque cifra los archivos con claves de Anthropic",
        "Porque los archivos persisten entre peticiones para poder reutilizarse, es decir, retención por diseño fuera del turno",
        "Porque solo funciona en Amazon Bedrock",
        "Porque los archivos se borran en 5 minutos",
      ],
      correctIndex: 1,
      explanation:
        "La Files API no es elegible para ZDR porque los archivos persisten entre peticiones para poder reutilizarse: eso es retención por diseño, fuera del turno de la petición. Es el mismo patrón que hace a Batches no elegible (resultados descargables durante días).",
    },
  ],
};
