import type { Lesson } from "@/lib/types";

// Nivel AVANZADO (dayRange [18, 27]).
// Día 25 — Zero Data Retention (ZDR): qué es, cómo afecta al almacenamiento y
// retención de datos, en qué condiciones aplica y por qué la columna ZDR de la
// matriz de features define la arquitectura en entornos regulados (Open Finance).
//
// Trazabilidad: Req 3.22, 4.4, 5.4, 6.1-6.4, 9.1, 9.2, 9.5.
export const day25: Lesson = {
  day: 25,
  slug: "zero-data-retention",
  title: "Zero Data Retention",
  section: "AVANZADO",
  estimatedMinutes: 22,
  icon: "concept-seguridad",
  objectives: [
    "Definir qué es Zero Data Retention (ZDR) y qué significa que una feature sea elegible o no elegible",
    "Explicar el patrón que determina la elegibilidad: lo que persiste datos fuera del turno de la petición pierde ZDR",
    "Enumerar las features no elegibles para ZDR y entender por qué cada una lo es",
    "Usar la columna ZDR de la matriz de features como primer criterio de arquitectura en un entorno regulado",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Zero Data Retention (ZDR) es el modo en que Anthropic no retiene las entradas ni las salidas de tus peticiones más allá del tiempo necesario para procesarlas y devolverte la respuesta. En términos prácticos: tus prompts y las respuestas de Claude no se almacenan del lado servidor una vez completado el turno. Para un dominio regulado como Open Finance, ZDR no es una optimización, es muchas veces un requisito de cumplimiento que condiciona qué features puedes usar.",
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Anthropic publica una matriz de disponibilidad por plataforma que incluye una columna de elegibilidad ZDR por feature. Esa tabla es la que hay que consultar ANTES de comprometerse con cualquier feature en un entorno regulado. Cada feature se etiqueta como Elegible o No elegible para ZDR.",
    },
    { type: "heading", level: 2, text: "El patrón que lo explica todo" },
    {
      type: "paragraph",
      text:
        "No hace falta memorizar la tabla entera. Hay un principio que la ordena: casi todo lo que persiste datos fuera del turno de la petición pierde elegibilidad ZDR. Si una feature necesita guardar algo entre peticiones —un archivo, un batch, una skill, el estado de una sesión— deja de ser compatible con ZDR, porque ZDR es precisamente la promesa de no retener.",
    },
    {
      type: "quote",
      text:
        "Si tu requisito es ZDR estricto, esa columna define tu arquitectura antes que cualquier otra consideración.",
      author: "Matriz de features — documentación de la Claude Developer Platform",
    },
    { type: "heading", level: 2, text: "Features no elegibles y por qué" },
    {
      type: "paragraph",
      text:
        "Estas son las features que la documentación marca como no elegibles para ZDR. Fíjate en que todas comparten el mismo rasgo: persisten datos más allá del turno.",
    },
    {
      type: "list",
      items: [
        "Procesamiento por lotes (Message Batches API): los resultados quedan descargables durante días tras la creación, así que hay retención por diseño.",
        "Files API: los archivos persisten entre peticiones para poder reutilizarlos; esa es justo la contrapartida.",
        "Agent Skills: las skills se almacenan como recursos reutilizables.",
        "MCP connector: infraestructura de herramientas que opera fuera del turno simple de la petición.",
        "Ejecución de código (code execution): herramienta de servidor con estado de ejecución.",
        "Llamada programática de herramientas: persiste contexto de orquestación de herramientas.",
        "Claude Managed Agents: las sesiones son de larga duración y almacenan historial, estado del sandbox y salidas del lado servidor (lo vimos en la lección de managed agents).",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Caso con matices: las salidas estructuradas son elegibles, pero con una excepción documentada: tus prompts y las salidas de Claude no se almacenan, aunque SÍ se cachean los esquemas JSON hasta 24 horas desde su último uso. Web search y web fetch también son elegibles con excepciones descritas en sus páginas. Lee siempre la nota al pie de la feature concreta.",
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Seguridad", icon: "concept-seguridad" },
        { service: "Compliance y gobernanza", icon: "concept-compliance" },
        { service: "Batches y Files", icon: "concept-batches" },
      ],
    },
    { type: "heading", level: 2, text: "Qué sí es elegible" },
    {
      type: "paragraph",
      text:
        "El núcleo del modelo sigue siendo compatible con ZDR: las ventanas de contexto de hasta 1M tokens, el thinking adaptativo, el effort, las citations, el soporte de PDF, la residencia de datos (inference_geo) y herramientas de cliente como bash, text editor y memory. Es decir, puedes construir una aplicación potente enteramente sobre features elegibles si el requisito de retención cero es duro.",
    },
    {
      type: "code",
      lang: "json",
      title: "Payload que se apoya solo en features elegibles para ZDR",
      code:
        "{\n" +
        "  \"model\": \"claude-opus-5\",\n" +
        "  \"max_tokens\": 4096,\n" +
        "  \"output_config\": { \"effort\": \"high\" },\n" +
        "  \"messages\": [\n" +
        "    {\n" +
        "      \"role\": \"user\",\n" +
        "      \"content\": \"Resume este extracto de cuenta y señala movimientos atípicos.\"\n" +
        "    }\n" +
        "  ]\n" +
        "}\n" +
        "// Sin Files, sin Batches, sin Skills: nada que persista fuera del turno.\n" +
        "// Thinking adaptativo, effort y ventana de contexto son elegibles para ZDR." ,
    },
    {
      type: "callout",
      variant: "success",
      text:
        "Regla práctica para Open Finance: parte de la columna ZDR, no de la columna de features deseables. Primero filtra lo elegible, y solo después decide la arquitectura. Si una feature no elegible es imprescindible, eso es una decisión de cumplimiento que hay que escalar, no un detalle de implementación.",
    },
    {
      type: "checklist",
      title: "Checklist de elegibilidad ZDR",
      items: [
        "Revisé la columna ZDR de la matriz de features para cada feature que pienso usar.",
        "Entiendo que persistir datos fuera del turno (Files, Batches, Skills, Managed Agents, code execution, MCP connector, llamada programática de herramientas) rompe la elegibilidad.",
        "Leí las notas al pie de los casos con matices (salidas estructuradas cachean esquemas 24 h; web search/fetch con excepciones).",
        "Confirmé la elegibilidad en la plataforma concreta (Claude API, AWS, Bedrock, Google Cloud o Microsoft Foundry) que voy a usar.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Qué describe mejor Zero Data Retention (ZDR) en la Claude Developer Platform?",
      options: [
        "Que Anthropic cifra los datos en reposo con claves gestionadas por el cliente",
        "Que no se retienen las entradas ni las salidas de la petición más allá de lo necesario para procesarla y devolver la respuesta",
        "Que los datos se retienen 29 días y luego se borran automáticamente",
        "Que las respuestas se guardan para reentrenar el modelo salvo que lo desactives",
      ],
      correctIndex: 1,
      explanation:
        "ZDR significa que tus prompts y las respuestas de Claude no se almacenan del lado servidor una vez completado el turno. El cifrado con claves del cliente es CMEK, un tema distinto; y la retención de 29 días es el comportamiento de los resultados de Batches, que por eso no es elegible para ZDR.",
    },
    {
      question:
        "Según el patrón de elegibilidad, ¿cuál de estas features NO es elegible para ZDR?",
      options: [
        "Thinking adaptativo",
        "Residencia de datos (inference_geo)",
        "Files API",
        "Soporte de PDF",
      ],
      correctIndex: 2,
      explanation:
        "La Files API no es elegible porque los archivos persisten entre peticiones para poder reutilizarse, y eso es retención por diseño. Thinking adaptativo, inference_geo y el soporte de PDF operan dentro del turno de la petición y sí son elegibles.",
    },
    {
      question:
        "En un proyecto de Open Finance con requisito de ZDR estricto, ¿cuál es el orden de decisión correcto?",
      options: [
        "Elegir primero las features más potentes y luego ver si alguna soporta ZDR",
        "Ignorar la columna ZDR porque aplica igual a todas las features",
        "Filtrar primero por la columna ZDR (features elegibles) y después decidir la arquitectura sobre ese subconjunto",
        "Activar todas las features en beta y desactivar la retención por workspace",
      ],
      correctIndex: 2,
      explanation:
        "Cuando ZDR es un requisito duro, la columna ZDR define la arquitectura antes que cualquier otra consideración: primero se filtra lo elegible y solo después se diseña sobre ese subconjunto. Usar una feature no elegible pasa a ser una decisión de cumplimiento, no de implementación.",
    },
  ],
};
