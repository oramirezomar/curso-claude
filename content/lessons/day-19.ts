import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 15.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-tools-detail.md (§8 MCP Connector).
// Terminología oficial. Req 3.13.
export const day19: Lesson = {
  day: 19,
  slug: "mcp-connector",
  title: "MCP connector",
  section: "AVANZADO",
  estimatedMinutes: 26,
  icon: "concept-mcp",
  objectives: [
    "Conectar servidores MCP remotos directamente desde la Messages API, sin implementar un cliente MCP aparte",
    "Declarar los dos componentes: la definición del servidor (mcp_servers) y el toolset MCP (tools)",
    "Entender cuándo Claude invoca una herramienta MCP y cuándo responde de conocimiento general",
    "Reconocer las limitaciones: solo llamadas a herramientas, servidor HTTP público, y que es beta no elegible para ZDR",
  ],
  blocks: [
    {
      type: "callout",
      variant: "warning",
      text:
        "El MCP connector está en BETA. Se activa con la cabecera anthropic-beta mcp-client-2025-11-20. NO es elegible para Zero Data Retention. Disponible en Claude API, Claude Platform on AWS y Microsoft Foundry (todas beta); no en Amazon Bedrock ni Google Cloud. La versión anterior mcp-client-2025-04-04 está deprecada.",
    },
    {
      type: "paragraph",
      text:
        "El MCP connector conecta con servidores MCP (Model Context Protocol) remotos directamente desde la Messages API, sin que tengas que implementar un cliente MCP aparte. Eso te da acceso a herramientas de terceros —Jira, Notion, tu propio servidor— con solo declararlas en la petición.",
    },
    { type: "heading", level: 2, text: "Los dos componentes" },
    {
      type: "list",
      items: [
        "Definición de servidor MCP: va en el array mcp_servers. Lleva los detalles de conexión: URL y autenticación.",
        "Toolset MCP: va en el array tools. Indica qué herramientas habilitar y cómo configurarlas.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "MCP connector", icon: "concept-mcp" },
        { service: "Tool use", icon: "concept-herramientas" },
        { service: "Managed Agents", icon: "concept-agentes" },
      ],
    },
    {
      type: "paragraph",
      text:
        "La configuración de herramientas es flexible: puedes habilitar todas, una lista blanca de específicas, o una lista negra de no deseadas, y configurar cada herramienta individualmente. La autenticación es OAuth con tokens Bearer, y puedes conectar a múltiples servidores en una sola petición.",
    },
    {
      type: "code",
      lang: "json",
      title: "Conectar un servidor MCP remoto desde la Messages API",
      code:
        "{\n" +
        "  \"model\": \"claude-opus-5\",\n" +
        "  \"max_tokens\": 1024,\n" +
        "  \"mcp_servers\": [\n" +
        "    {\n" +
        "      \"type\": \"url\",\n" +
        "      \"url\": \"https://mcp.ejemplo.com/sse\",\n" +
        "      \"name\": \"jira\",\n" +
        "      \"authorization_token\": \"Bearer <token>\"\n" +
        "    }\n" +
        "  ],\n" +
        "  \"messages\": [\n" +
        "    { \"role\": \"user\", \"content\": \"¿Qué está bloqueando la release?\" }\n" +
        "  ]\n" +
        "}",
      highlightLines: [4, 5, 6, 7],
    },
    { type: "heading", level: 2, text: "Cuándo invoca Claude una herramienta MCP" },
    {
      type: "paragraph",
      text:
        "El criterio es útil porque delimita expectativas: Claude llama a una herramienta cuando la petición mapea a la capacidad descrita de la herramienta, sea explícita (\"busca bugs abiertos en Jira\") o implícita (\"¿qué está bloqueando la release?\" con un servidor de Jira conectado). Pero NO llama a una herramienta MCP para preguntas de conocimiento general sobre el servicio.",
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Ejemplo del contraste: \"¿cómo funcionan las bases de datos de Notion?\" con un servidor de Notion conectado se responde directamente, sin invocar la herramienta. \"¿qué hay en mi base de datos de Proyectos?\" sí dispara la herramienta. Puedes modular esa disposición desde el prompt de sistema.",
    },
    { type: "heading", level: 2, text: "Las limitaciones" },
    {
      type: "list",
      items: [
        "Del conjunto de features de la especificación MCP, solo las llamadas a herramientas están soportadas. No hay recursos, prompts ni otras primitivas.",
        "El servidor debe estar expuesto públicamente por HTTP, con transporte Streamable HTTP o SSE.",
        "Los servidores STDIO locales no se pueden conectar directamente.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "La segunda limitación condiciona la arquitectura: un servidor MCP local requiere un túnel o un despliegue accesible. Para eso existe la API de MCP Tunnels (research preview dentro de la beta de Managed Agents), que resuelve la conexión a servidores no expuestos públicamente.",
    },
    {
      type: "checklist",
      title: "Checklist de MCP connector",
      items: [
        "Envío la cabecera beta mcp-client-2025-11-20 (no la deprecada mcp-client-2025-04-04).",
        "Declaro el servidor en mcp_servers y el toolset en tools.",
        "Mi servidor MCP está expuesto por HTTP público (Streamable HTTP o SSE).",
        "Para servidores locales, considero MCP Tunnels.",
        "Si el requisito es ZDR, descarto el MCP connector.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Qué dos componentes hay que declarar para usar el MCP connector?",
      options: [
        "Solo el array tools",
        "La definición del servidor en mcp_servers (URL, autenticación) y el toolset MCP en el array tools",
        "Un endpoint /v1/mcp y una clave aparte",
        "Un webhook y un vault",
      ],
      correctIndex: 1,
      explanation:
        "Son dos componentes: la definición de servidor MCP en el array mcp_servers (detalles de conexión: URL y autenticación) y el toolset MCP en el array tools (qué herramientas habilitar y cómo configurarlas). La autenticación es OAuth con tokens Bearer.",
    },
    {
      question: "Con un servidor de Notion conectado, ¿cuándo NO invoca Claude la herramienta MCP?",
      options: [
        "Cuando preguntas \"¿qué hay en mi base de datos de Proyectos?\"",
        "Cuando preguntas \"¿cómo funcionan las bases de datos de Notion?\" (conocimiento general), que responde directamente",
        "Nunca invoca herramientas MCP",
        "Siempre invoca la herramienta, para cualquier pregunta",
      ],
      correctIndex: 1,
      explanation:
        "Claude invoca una herramienta MCP cuando la petición mapea a la capacidad descrita de la herramienta (explícita o implícitamente). No la invoca para preguntas de conocimiento general sobre el servicio: \"¿cómo funcionan las bases de datos de Notion?\" se responde directamente; \"¿qué hay en mi base de datos de Proyectos?\" sí la dispara.",
    },
    {
      question: "¿Cuál es una limitación clave del MCP connector que condiciona la arquitectura?",
      options: [
        "Soporta todas las primitivas MCP (recursos, prompts, herramientas)",
        "El servidor debe estar expuesto públicamente por HTTP; los servidores STDIO locales no se conectan directamente (para eso están los MCP Tunnels)",
        "Solo funciona con servidores de Anthropic",
        "Requiere un cliente MCP implementado por ti",
      ],
      correctIndex: 1,
      explanation:
        "El MCP connector solo soporta llamadas a herramientas (no recursos ni prompts) y exige que el servidor esté expuesto públicamente por HTTP (Streamable HTTP o SSE). Los servidores STDIO locales no se conectan directamente: requieren un túnel o despliegue accesible, de ahí la API de MCP Tunnels.",
    },
  ],
};
