import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 15.2). Cierre del curso: arquitectura de
// referencia y buenas prácticas que recapitulan el temario. Fuente de verdad:
// todo el corpus docs-referencia/claude/. Terminología oficial. Req 3.18.
export const day27: Lesson = {
  day: 27,
  slug: "arquitectura-y-buenas-practicas",
  title: "Arquitectura y buenas prácticas",
  section: "AVANZADO",
  estimatedMinutes: 30,
  icon: "concept-arquitectura",
  objectives: [
    "Diseñar una arquitectura de referencia sobre la Claude Developer Platform aplicando lo aprendido en el curso",
    "Elegir modelo, effort y palancas de coste (caché, batches) según el perfil de cada carga",
    "Hacer robusta la integración: manejo de errores, rate limits, valores de enum desconocidos y streaming",
    "Partir de las restricciones de cumplimiento (ZDR, plataforma) como primer criterio de diseño, no como un añadido",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Llegamos al cierre. Este día no introduce una API nueva: junta todo lo anterior en un modelo de decisión. Construir bien sobre la Claude Developer Platform no es memorizar endpoints, es saber qué palanca tocar en cada situación y en qué orden tomar las decisiones. Empezamos por donde más cuesta corregir: las restricciones.",
    },
    { type: "heading", level: 2, text: "1. Primero las restricciones, luego las features" },
    {
      type: "paragraph",
      text:
        "En un entorno regulado como Open Finance, el orden de decisión correcto es contraintuitivo: primero filtras por lo que PUEDES usar (elegibilidad ZDR, disponibilidad en tu plataforma), y solo después diseñas sobre ese subconjunto. Si una feature no elegible es imprescindible, eso es una decisión de cumplimiento que se escala, no un detalle de implementación.",
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Arquitectura y buenas prácticas", icon: "concept-arquitectura" },
        { service: "Zero Data Retention", icon: "concept-seguridad" },
        { service: "Plataformas cloud", icon: "concept-plataformas" },
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Recordatorio del curso: casi todo lo que persiste datos fuera del turno pierde elegibilidad ZDR (Batches, Files, Agent Skills, MCP connector, code execution, Managed Agents). Si tu requisito es ZDR estricto, esa columna define tu arquitectura antes que cualquier otra consideración.",
    },
    { type: "heading", level: 2, text: "2. Elegir modelo y effort por perfil de carga" },
    {
      type: "list",
      items: [
        "Razonamiento profundo o trabajo agéntico de horizonte largo: Fable 5.1 u Opus 5, con effort alto o xhigh.",
        "Equilibrio velocidad/inteligencia para peticiones interactivas: Sonnet 5.",
        "Latencia y coste mínimos (clasificaciones, subagentes, respuestas cortas): Haiku 4.5.",
        "Mide con tus propias evaluaciones antes de fijar la decisión; el perfil de la tarea manda sobre el precio.",
      ],
    },
    { type: "heading", level: 2, text: "3. Controlar el coste con las palancas correctas" },
    {
      type: "list",
      items: [
        "Caché de prompts para prefijos estables (prompt de sistema, documentos): lecturas al 10% del precio base de entrada.",
        "Message Batches para volumen asíncrono: 50% de descuento, con TTL de caché de 1h cuando hay contexto compartido.",
        "effort bajo donde la tarea no exige razonamiento profundo; recuerda que high equivale a no fijar el parámetro.",
        "Gestión de contexto (compaction) en conversaciones largas para no inflar la ventana.",
      ],
    },
    {
      type: "code",
      lang: "python",
      title: "Patrón de referencia: Sonnet 5 + caché + salida estructurada",
      code:
        "from anthropic import Anthropic\n" +
        "\n" +
        "client = Anthropic()\n" +
        "\n" +
        "SISTEMA = [{\n" +
        "    \"type\": \"text\",\n" +
        "    \"text\": POLITICAS_Y_CONTEXTO_DE_DOMINIO,  # largo y estable\n" +
        "    \"cache_control\": {\"type\": \"ephemeral\", \"ttl\": \"1h\"},\n" +
        "}]\n" +
        "\n" +
        "resp = client.messages.create(\n" +
        "    model=\"claude-sonnet-5\",\n" +
        "    max_tokens=1024,\n" +
        "    system=SISTEMA,\n" +
        "    output_config={\"format\": {\"type\": \"json_schema\", \"schema\": ESQUEMA}},\n" +
        "    messages=[{\"role\": \"user\", \"content\": consulta}],\n" +
        ")\n" +
        "# Verifica el acierto de caché en resp.usage.cache_read_input_tokens",
      highlightLines: [8, 15],
    },
    { type: "heading", level: 2, text: "4. Robustez: fallos, límites y evolución" },
    {
      type: "list",
      items: [
        "Maneja todos los stop_reason, con un default tolerante: pause_turn no es error, es continuación.",
        "Tolera valores de enum desconocidos: la API puede añadir variantes sin cambiar tu versión.",
        "Aplica backoff exponencial y respeta retry-after; distingue el 429 por límite de tasa del 429 por tope de gasto.",
        "En streaming, captura el evento error aunque el HTTP inicial fuera 200.",
        "Para cargas automatizadas, autentica con Workload Identity Federation en vez de claves estáticas.",
      ],
    },
    {
      type: "callout",
      variant: "success",
      text:
        "El hilo conductor del curso: la superficie estable (Messages, Batches, Models, Files, Skills) es pequeña y firme; todo lo avanzado (agentes gestionados, administración, gestión de contexto) vive detrás de cabeceras beta. Construye tu núcleo sobre lo GA y aísla lo beta tras una capa propia para poder absorber cambios con aviso.",
    },
    {
      type: "quote",
      text:
        "No se trata de conocer todos los endpoints, sino de saber qué palanca tocar en cada situación y en qué orden decidir: restricciones, modelo, coste, robustez.",
      author: "Cierre del curso — Claude Developer Platform",
    },
    {
      type: "checklist",
      title: "Checklist de arquitectura de referencia",
      items: [
        "Partí de las restricciones (ZDR, plataforma) antes de elegir features.",
        "Elegí modelo y effort por el perfil de cada carga, validado con evaluaciones.",
        "Apliqué caché de prompts, batches y gestión de contexto donde compensan.",
        "Hice la integración robusta: errores, rate limits, enums desconocidos, streaming.",
        "Autentiqué cargas automatizadas con WIF y aislé lo beta tras una capa propia.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "En un proyecto regulado (Open Finance), ¿cuál es el orden de decisión arquitectónica recomendado?",
      options: [
        "Elegir las features más potentes y ver después si cumplen el requisito",
        "Partir de las restricciones (elegibilidad ZDR, disponibilidad en tu plataforma) y diseñar solo sobre el subconjunto permitido",
        "Elegir siempre el modelo más caro por seguridad",
        "Ignorar el cumplimiento hasta la fase de pruebas",
      ],
      correctIndex: 1,
      explanation:
        "El orden correcto es restricciones primero: filtras por lo que puedes usar (ZDR, plataforma) y después diseñas sobre ese subconjunto. Si una feature no elegible es imprescindible, es una decisión de cumplimiento a escalar, no un detalle de implementación.",
    },
    {
      question: "¿Cuál es una buena práctica de robustez frente a la evolución del contrato de la API?",
      options: [
        "Usar un switch exhaustivo de stop_reason que lance en el default",
        "Tolerar valores de enum desconocidos (la API puede añadir variantes sin cambiar tu versión) y tratar pause_turn como continuación, no error",
        "Fijar temperature a 0 en cada petición",
        "Comprobar solo el status HTTP inicial en streaming",
      ],
      correctIndex: 1,
      explanation:
        "El contrato permite añadir variantes de enum sin cambiar tu versión, así que tu código debe tolerar valores desconocidos con un default elegante. pause_turn es continuación, no error. Y en streaming hay que capturar el evento error aunque el HTTP inicial fuera 200.",
    },
    {
      question: "¿Cómo conviene estructurar la aplicación respecto a la superficie GA y la beta de la plataforma?",
      options: [
        "Construir todo directamente sobre las features beta para ir por delante",
        "Construir el núcleo sobre lo GA (Messages, Batches, Models, Files, Skills) y aislar lo beta tras una capa propia para absorber cambios con aviso",
        "Evitar por completo cualquier feature beta siempre",
        "Mezclar GA y beta sin separación, porque el contrato es idéntico",
      ],
      correctIndex: 1,
      explanation:
        "La superficie estable es pequeña y firme; lo avanzado vive detrás de cabeceras beta y puede cambiar con aviso. La práctica recomendada es construir el núcleo sobre lo GA y aislar lo beta tras una capa propia, para poder absorber cambios sin reescribir toda la aplicación.",
    },
  ],
};
