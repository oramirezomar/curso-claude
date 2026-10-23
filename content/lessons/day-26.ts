import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 15.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-reference-claude-com.md (§7 Matriz de
// Features, §11 Plataformas Cloud, §12 Niveles de Estabilidad). Terminología
// oficial. Req 3.21.
export const day26: Lesson = {
  day: 26,
  slug: "plataformas-cloud-matriz",
  title: "Plataformas cloud y matriz de features",
  section: "AVANZADO",
  estimatedMinutes: 28,
  icon: "concept-plataformas",
  objectives: [
    "Distinguir las cinco plataformas y quién las opera: Anthropic frente a socio",
    "Leer la matriz de features por plataforma y entender que la clasificación es por feature Y plataforma",
    "Elegir plataforma según acceso a features, compromisos cloud y requisitos de cumplimiento",
    "Reconocer las implicaciones de la distinción operada-por-Anthropic frente a operada-por-socio",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Claude no vive en un solo sitio. Puedes acceder a los modelos por la Claude API directa o a través de plataformas cloud, y la decisión no es cosmética: determina qué features tienes, quién fija las fechas de retiro y qué límites aplican. La matriz de disponibilidad por plataforma es la única fuente fiable para saber qué tienes dónde.",
    },
    { type: "heading", level: 2, text: "Las cinco plataformas" },
    {
      type: "list",
      items: [
        "Claude API (Anthropic, operada por Anthropic): acceso directo a los modelos y features más recientes.",
        "Claude Platform on AWS (AWS, operada por Anthropic): usa los IDs de la Claude API y sigue su ciclo de vida.",
        "Microsoft Foundry (Azure, operada por Anthropic): sigue el calendario de la Claude API.",
        "Amazon Bedrock (AWS, operada por socio): fija sus propias fechas de retiro.",
        "Agent Platform en Google Cloud (operada por socio): fija sus propias fechas.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Plataformas cloud", icon: "concept-plataformas" },
        { service: "Modelos y precios", icon: "concept-modelos" },
        { service: "Ciclo de vida de modelos", icon: "concept-ciclo-vida" },
      ],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "La distinción operada-por-Anthropic frente a operada-por-socio no es cosmética: determina quién fija las fechas de retiro de modelos, qué features llegan primero y qué límites de tamaño de petición aplican. Claude Managed Agents, por ejemplo, está disponible en la Claude API directa y en Claude Platform on AWS, no en el resto.",
    },
    { type: "heading", level: 2, text: "La matriz de features" },
    {
      type: "paragraph",
      text:
        "Anthropic publica una matriz de disponibilidad por plataforma que incluye la elegibilidad ZDR de cada feature. La particularidad del modelo de estabilidad de Claude es que la clasificación no es solo por feature, sino por feature Y plataforma: una misma capacidad puede estar GA en la Claude API, beta en Claude Platform on AWS y ausente en Bedrock.",
    },
    {
      type: "code",
      lang: "text",
      title: "Extracto de la matriz (✓ disponible, β beta, vacío ausente)",
      code:
        "Feature                    CA   AWS  BR   GC   MF\n" +
        "-------------------------  ---  ---  ---  ---  ---\n" +
        "Ventanas de contexto 1M     ✓    ✓    ✓    ✓    ✓\n" +
        "Procesamiento por lotes     ✓    ✓\n" +
        "Browser use                 ✓              ✓\n" +
        "Computer use                ✓    β    β    ✓    β\n" +
        "MCP connector               β    β              β\n" +
        "Files API                   ✓    β              β\n" +
        "CA=Claude API AWS=Platform on AWS BR=Bedrock GC=Google Cloud MF=Foundry",
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Lectura clave de la matriz: de 387 páginas de referencia de endpoints, 284 son beta. La superficie estable es deliberadamente pequeña (Messages, Batches, Models, Files, Skills) y todo el aparato de agentes y de administración vive detrás de cabeceras beta. En Microsoft Foundry, además, varias features solo están en los deployments Hosted on Anthropic, no en los Hosted on Azure.",
    },
    { type: "heading", level: 2, text: "Cómo elegir" },
    {
      type: "list",
      items: [
        "Claude API directa: integraciones nuevas, acceso completo a features más recientes, relación directa con Anthropic.",
        "Plataformas cloud: cuando ya tienes compromisos cloud, requisitos de cumplimiento concretos, o quieres facturación consolidada con tu proveedor.",
        "Para un requisito de cumplimiento, cruza SIEMPRE la feature que necesitas con la columna de tu plataforma y con la elegibilidad ZDR antes de comprometerte.",
      ],
    },
    {
      type: "callout",
      variant: "success",
      text:
        "Para Open Finance: la matriz es la primera tabla que debes abrir. No des por hecho que una feature que ves en la Claude API está en tu plataforma cloud o es elegible para ZDR allí. La clasificación por feature Y plataforma significa que la única fuente fiable es la celda concreta que te aplica.",
    },
    {
      type: "checklist",
      title: "Checklist de elección de plataforma",
      items: [
        "Sé quién opera mi plataforma (Anthropic o socio) y qué implica para retiros y límites.",
        "Crucé cada feature que necesito con la columna de mi plataforma en la matriz.",
        "Verifiqué la elegibilidad ZDR de esas features en mi plataforma.",
        "En Microsoft Foundry, confirmé si necesito un deployment Hosted on Anthropic.",
        "Asumo que gran parte de la superficie avanzada es beta.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Qué tiene de particular el modelo de estabilidad de features de la Claude Developer Platform?",
      options: [
        "Una feature es GA o beta de forma global, igual en todas las plataformas",
        "La clasificación es por feature Y plataforma: una misma capacidad puede estar GA en la Claude API, beta en Claude Platform on AWS y ausente en Bedrock",
        "Todas las features están siempre en beta",
        "La estabilidad solo depende del modelo elegido",
      ],
      correctIndex: 1,
      explanation:
        "La clasificación no es solo por feature, sino por feature y plataforma. Una misma capacidad puede estar GA en la Claude API, beta en Claude Platform on AWS y ausente en Bedrock. Por eso la matriz de disponibilidad es la única fuente fiable: hay que mirar la celda concreta que te aplica.",
    },
    {
      question: "¿Qué implica que una plataforma sea operada por un socio (Amazon Bedrock, Google Cloud) en lugar de por Anthropic?",
      options: [
        "Nada; el comportamiento es idéntico al de la Claude API",
        "Fijan sus propias fechas de retiro de modelos (distintas de las de Anthropic) y tienen sus propios límites de tamaño de petición",
        "No pueden ejecutar ningún modelo de Claude",
        "Siempre reciben las features nuevas primero",
      ],
      correctIndex: 1,
      explanation:
        "Las plataformas operadas por socios (Bedrock, Google Cloud) fijan sus propias fechas de retiro, distintas de las de Anthropic, y tienen límites propios de tamaño de petición. Por eso un modelo retirado en la Claude API puede seguir ahí. Las operadas por Anthropic (Claude API, Platform on AWS, Foundry) comparten su calendario.",
    },
    {
      question: "Para un proyecto de Open Finance con un requisito de cumplimiento, ¿cuál es el primer paso al elegir una feature?",
      options: [
        "Elegir la feature por su potencia y asumir que está en todas las plataformas",
        "Cruzar la feature con la columna de tu plataforma en la matriz y verificar su elegibilidad ZDR antes de comprometerte",
        "Usar siempre Amazon Bedrock por defecto",
        "Ignorar la matriz porque todas las features son equivalentes",
      ],
      correctIndex: 1,
      explanation:
        "La matriz de features es la primera tabla a consultar: hay que cruzar cada feature que necesitas con la columna de tu plataforma y con la elegibilidad ZDR. No se debe dar por hecho que una feature vista en la Claude API esté en tu plataforma cloud o sea elegible para ZDR allí.",
    },
  ],
};
