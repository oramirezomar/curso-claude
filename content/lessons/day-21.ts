import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 15.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-agents-detail.md (§3 Agents, §4 Environments,
// §5 Sessions, §6 Permission Policies, §7 Budgets, §11 Scheduled Deployments).
// Terminología oficial. Req 3.14.
export const day21: Lesson = {
  day: 21,
  slug: "managed-agents-operacion",
  title: "Managed agents: operación",
  section: "AVANZADO",
  estimatedMinutes: 30,
  icon: "concept-agentes",
  objectives: [
    "Operar el flujo completo: crear un Agent, configurar un Environment, lanzar una Session y enviar Events",
    "Aplicar la semántica de actualización: arrays que se reemplazan enteros, metadata que se fusiona por clave",
    "Controlar la ejecución con permission policies, presupuestos de sesión y scheduled deployments",
    "Evitar las trampas: overrides de sesión que no se fusionan y el 409 por version que no coincide",
  ],
  blocks: [
    {
      type: "callout",
      variant: "warning",
      text:
        "Managed Agents está en BETA completa: cada petición exige la cabecera managed-agents-2026-04-01, y no es elegible para ZDR ni para cobertura BAA de HIPAA. Esta lección es la continuación operativa de \"Managed agents: conceptos\".",
    },
    {
      type: "paragraph",
      text:
        "Con los conceptos claros (Agent, Environment, Session, Events), toca operarlos. El flujo es estable: defines el agente una vez, configuras el entorno, lanzas una sesión que los referencia, y envías mensajes de usuario como eventos. Claude ejecuta herramientas de forma autónoma y transmite resultados por SSE.",
    },
    { type: "heading", level: 2, text: "El flujo operativo" },
    {
      type: "list",
      ordered: true,
      items: [
        "Definir el agente: modelo, prompt de sistema, herramientas, servidores MCP, skills. Se crea una vez y se referencia por ID.",
        "Configurar el entorno: sandbox cloud gestionado por Anthropic o autoalojado en tu infraestructura.",
        "Lanzar una sesión que referencie agente y entorno.",
        "Enviar mensajes de usuario como eventos; el historial se persiste del lado servidor y se recupera completo por GET.",
        "Guiar o interrumpir enviando eventos de usuario adicionales a mitad de ejecución.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Managed Agents", icon: "concept-agentes" },
        { service: "MCP connector", icon: "concept-mcp" },
        { service: "Admin API", icon: "concept-admin" },
      ],
    },
    { type: "heading", level: 2, text: "Semántica de actualización de un Agent" },
    {
      type: "paragraph",
      text:
        "Actualizar un agente tiene reglas asimétricas que son la trampa principal. Los campos omitidos se preservan. Los escalares (model, system, name, description) se reemplazan. Los arrays (tools, mcp_servers, skills) se reemplazan POR COMPLETO. Pero metadata se FUSIONA a nivel de clave.",
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Un PATCH con tools: [una_herramienta] BORRA el resto de herramientas, porque los arrays se reemplazan enteros. En cambio, metadata se fusiona por clave. Y si envías version y no coincide con la versión actual del agente, la petición devuelve 409, incluso si el cambio sería válido. Además, actualizar un subagente NO propaga el cambio a los coordinadores que lo referencian en su roster.",
    },
    {
      type: "code",
      lang: "bash",
      title: "Crear un agente (cabecera beta obligatoria)",
      code:
        "curl https://api.anthropic.com/v1/agents \\\n" +
        "  -H \"Authorization: Bearer $ANTHROPIC_API_KEY\" \\\n" +
        "  -H \"anthropic-version: 2023-06-01\" \\\n" +
        "  -H \"anthropic-beta: managed-agents-2026-04-01\" \\\n" +
        "  -H \"content-type: application/json\" \\\n" +
        "  -d '{\n" +
        "    \"name\": \"analista-financiero\",\n" +
        "    \"model\": { \"id\": \"claude-opus-5\", \"effort\": \"high\" },\n" +
        "    \"system\": \"Analizas reportes y resumes riesgos.\"\n" +
        "  }'",
      highlightLines: [4],
    },
    { type: "heading", level: 2, text: "Overrides de sesión y entorno" },
    {
      type: "paragraph",
      text:
        "Una sesión puede sobrescribir campos del agente: omitir un campo lo hereda, fijarlo a null lo limpia, fijarlo a un valor lo reemplaza. Pero las sobrescrituras NUNCA se fusionan: un override de tools tiene que listar TODAS las herramientas que la sesión necesita, no solo las que añade.",
    },
    {
      type: "paragraph",
      text:
        "El entorno controla el acceso de red saliente. En modo limited, listar un host en allowed_hosts no basta para los gestores de paquetes: hay que poner además allow_package_managers true siempre que el entorno declare packages, o la petición se rechaza con 400. Es una compuerta independiente, contraintuitiva.",
    },
    { type: "heading", level: 2, text: "Gobernar la ejecución" },
    {
      type: "list",
      items: [
        "Permission policies: always_allow (ejecuta sin confirmación), always_ask (pausa y espera tu aprobación), auto (el servidor evalúa cada llamada). Aplican a herramientas de servidor, no a las de cliente, que ejecutas tú.",
        "Budgets: un techo de gasto duro y opcional por sesión. La plataforma tarifica a precios de lista y detiene la sesión al alcanzarlo.",
        "Scheduled deployments: corridas recurrentes por cron (granularidad máxima de minuto), con agente, entorno y al menos un evento inicial obligatorios.",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "auto es el modo interesante para producción: delega el juicio al servidor por llamada, en lugar de una decisión global por herramienta. Y recuerda que los webhooks devuelven solo el type y el id del evento, no el objeto completo: al recibirlos hay que recuperar el objeto con un GET para no actuar sobre datos obsoletos.",
    },
    {
      type: "checklist",
      title: "Checklist de operación de Managed Agents",
      items: [
        "Envío la cabecera managed-agents-2026-04-01 en cada petición.",
        "En un PATCH de arrays (tools, skills), incluyo la lista completa, no solo lo que añado.",
        "Si fijo version en la actualización, verifico que coincide o manejo el 409.",
        "Los overrides de sesión listan todo lo necesario; no se fusionan.",
        "Con packages en el entorno y networking limited, pongo allow_package_managers true.",
        "Elijo permission policy (auto para producción) y fijo budget si aplica.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "Haces un PATCH a un agente con tools: [una_sola_herramienta]. ¿Qué ocurre con el resto de herramientas?",
      options: [
        "Se conservan; el PATCH solo añade la nueva",
        "Se borran: los campos de array (tools, mcp_servers, skills) se reemplazan por completo, no se fusionan",
        "La petición falla siempre con 400",
        "Se fusionan por clave como metadata",
      ],
      correctIndex: 1,
      explanation:
        "Los campos de array se reemplazan por completo. Un PATCH con tools: [una_herramienta] borra el resto. La asimetría es la trampa: los arrays se reemplazan enteros, pero metadata se fusiona a nivel de clave. Para limpiar un array se pasa null o un array vacío.",
    },
    {
      question: "Una sesión sobrescribe el campo tools del agente. ¿Qué debe contener ese override?",
      options: [
        "Solo las herramientas nuevas que la sesión añade; se fusionan con las del agente",
        "Todas las herramientas que la sesión necesita, porque los overrides nunca se fusionan con la configuración del agente",
        "Nada; el override de tools no está permitido",
        "Únicamente un identificador del agente",
      ],
      correctIndex: 1,
      explanation:
        "Las sobrescrituras de sesión nunca se fusionan con la configuración del agente: reemplazan. Un override de tools tiene que listar todas las herramientas que la sesión necesita, no solo las que añade. Omitir el campo hereda, null lo limpia, un valor lo reemplaza por completo.",
    },
    {
      question: "¿Qué hace la permission policy \"auto\" en una sesión de Managed Agents?",
      options: [
        "Ejecuta todas las herramientas sin confirmación nunca",
        "El servidor evalúa cada llamada y la ejecuta, la deniega o se pausa pidiendo tu aprobación, por llamada",
        "Pausa siempre y espera aprobación para cualquier herramienta",
        "Deshabilita las herramientas de servidor",
      ],
      correctIndex: 1,
      explanation:
        "auto delega el juicio al servidor por llamada: evalúa cada invocación y la ejecuta, la deniega o se pausa pidiendo aprobación. Es el modo interesante para producción frente a always_allow (sin confirmación) y always_ask (pausa siempre). Aplica a herramientas de servidor, no a las de cliente.",
    },
  ],
};
