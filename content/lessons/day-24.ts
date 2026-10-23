import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 15.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-admin-detail.md (§10 Compliance API, CMEK,
// inference hooks) y claude-reference-claude-com.md (§6 Text Completions
// legacy). Terminología oficial. Req 3.17, 3.24.
export const day24: Lesson = {
  day: 24,
  slug: "compliance-y-gobernanza",
  title: "Compliance y gobernanza",
  section: "AVANZADO",
  estimatedMinutes: 30,
  icon: "concept-compliance",
  objectives: [
    "Usar la Compliance API para auditoría retrospectiva: Activity Feed, contenido y sesiones",
    "Elegir entre features adyacentes: Compliance API, audit logs, Analytics, OpenTelemetry e inference hooks",
    "Entender el eje temporal: inference hooks actúan antes de la inferencia; la Compliance API cuenta lo ocurrido",
    "Situar las menciones de nicho: Text Completions (legacy), CMEK por proveedor e inference hooks (beta)",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "En un dominio regulado como Open Finance, demostrar qué pasó y controlar qué puede pasar son requisitos de primer orden. La Claude Developer Platform ofrece un conjunto de herramientas de gobernanza que conviene no confundir, porque varias se solapan y resuelven momentos distintos del ciclo de vida de un dato.",
    },
    { type: "heading", level: 2, text: "La Compliance API" },
    {
      type: "paragraph",
      text:
        "Da acceso programático al Activity Feed de la organización, y en Claude Enterprise también al directorio de usuarios y roles y al contenido. Todos sus endpoints viven bajo /v1/compliance/*, autentican por x-api-key y comparten un límite de 600 peticiones por minuto por organización padre.",
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Compliance y gobernanza", icon: "concept-compliance" },
        { service: "Admin API", icon: "concept-admin" },
        { service: "Zero Data Retention", icon: "concept-seguridad" },
      ],
    },
    {
      type: "list",
      items: [
        "Activity Feed (GET /v1/compliance/activities): disponible con cualquier clave que lleve el ámbito read:compliance_activities. Lo alcanzan la Compliance Access Key (claude.ai) y la Admin API key (Console).",
        "Contenido: leer chats, archivos y adjuntos; borrar chats, archivos y proyectos bajo demanda. Requiere Compliance Access Key.",
        "Sesiones: listar las que tus usuarios ejecutan y recuperar transcripciones. Requiere Compliance Access Key.",
      ],
    },
    { type: "heading", level: 2, text: "Elegir entre features adyacentes" },
    {
      type: "paragraph",
      text:
        "Cuatro features se solapan, y la distinción clave es el eje temporal. Los inference hooks actúan antes de que ocurra; la Compliance API te cuenta lo que ocurrió.",
    },
    {
      type: "code",
      lang: "text",
      title: "Qué elegir según el momento y el objetivo",
      code:
        "Compliance API      Registros retrospectivos por API. Auditoría y forense.\n" +
        "Export audit logs   CSV manual de eventos. Más limitado; sin automatizar.\n" +
        "Analytics APIs      Cifras agregadas de uso y coste. IT, FinOps, plataforma.\n" +
        "OpenTelemetry       Telemetría por evento en tiempo real a tu colector.\n" +
        "Inference hooks     Actúan EN LÍNEA antes de la inferencia; pueden DENEGAR.",
      highlightLines: [5],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Los inference hooks están en BETA y actúan en línea: tu servidor de seguridad de IA recibe cada prompt gobernado antes de la inferencia y puede denegarlo en tiempo real. Para Open Finance la regla es clara: si el requisito es IMPEDIR que ciertos datos entren a un prompt, los hooks son la herramienta (control preventivo); si es DEMOSTRAR qué pasó ante un auditor, es la Compliance API (control detectivo).",
    },
    { type: "heading", level: 2, text: "CMEK y residencia de datos" },
    {
      type: "paragraph",
      text:
        "La gobernanza incluye además CMEK (claves de cifrado gestionadas por el cliente), con páginas específicas por proveedor: AWS KMS, Azure Key Vault y Google Cloud KMS. La vía programática de CMEK son los endpoints external_keys de la Admin API, que están entre los pocos disponibles en Claude Platform on AWS. Se suman access transparency, data residency (inference_geo) y App Attest.",
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Menciones de nicho para cerrar el mapa: la API de Text Completions (endpoint completions) es LEGACY, anterior a Messages, que es su sucesora. CMEK depende del proveedor de nube que uses. Y los inference hooks son el único control que bloquea un prompt antes de la inferencia, frente a todo lo demás, que es retrospectivo o agregado.",
    },
    {
      type: "checklist",
      title: "Checklist de compliance y gobernanza",
      items: [
        "Para auditoría retrospectiva, uso la Compliance API (Activity Feed, contenido, sesiones).",
        "Para control preventivo en tiempo real, evalúo los inference hooks (beta).",
        "Para cifrado con mis propias claves, configuro CMEK según mi proveedor (AWS/Azure/GCP).",
        "Fijo la residencia de datos con inference_geo cuando el requisito lo exige.",
        "No uso la API legacy de Text Completions en integraciones nuevas: uso Messages.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "En el eje temporal de la gobernanza, ¿qué diferencia a los inference hooks de la Compliance API?",
      options: [
        "Son lo mismo con distinto nombre",
        "Los inference hooks actúan en línea ANTES de la inferencia y pueden denegar el prompt; la Compliance API es retrospectiva y te cuenta lo que ya ocurrió",
        "La Compliance API bloquea prompts y los hooks solo informan",
        "Ambos son agregados, como Analytics",
      ],
      correctIndex: 1,
      explanation:
        "Están en extremos opuestos del eje temporal: los inference hooks (beta) actúan en línea, reciben cada prompt antes de la inferencia y pueden denegarlo (control preventivo). La Compliance API devuelve registros retrospectivos (control detectivo). Para impedir que un dato entre a un prompt, hooks; para demostrar qué pasó, Compliance API.",
    },
    {
      question: "¿Qué es la API de Text Completions en la Claude Developer Platform?",
      options: [
        "La API recomendada para integraciones nuevas",
        "Una API legacy, anterior a Messages, que es su sucesora; no se usa para integraciones nuevas",
        "Un sinónimo de la Messages API",
        "Una feature beta de streaming",
      ],
      correctIndex: 1,
      explanation:
        "La API de Text Completions (endpoint completions) es legacy: es anterior a la Messages API, que es su sucesora. Para integraciones nuevas se usa Messages. Aparece en el inventario marcada explícitamente como legacy, con solo el endpoint create.",
    },
    {
      question: "¿Cuál es la vía programática de CMEK y dónde está disponible de forma destacada?",
      options: [
        "El endpoint /v1/messages, en todas las plataformas",
        "Los endpoints external_keys de la Admin API, que están entre los pocos disponibles en Claude Platform on AWS",
        "La Compliance API, solo en claude.ai",
        "No hay vía programática para CMEK",
      ],
      correctIndex: 1,
      explanation:
        "CMEK (claves de cifrado gestionadas por el cliente) se gestiona programáticamente con los endpoints external_keys de la Admin API, que son de los pocos disponibles en Claude Platform on AWS. Hay páginas específicas por proveedor: AWS KMS, Azure Key Vault y Google Cloud KMS.",
    },
  ],
};
