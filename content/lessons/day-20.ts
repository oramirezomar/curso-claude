import type { Lesson } from "@/lib/types";

// Nivel AVANZADO (dayRange [18, 27]).
// Día 20 — Managed Agents: conceptos. Qué son los Claude Managed Agents de la
// Claude Developer Platform, su modelo conceptual (Agent / Environment /
// Session / Events) y cuándo conviene usarlos frente a la Messages API.
//
// Estado: BETA completa (cabecera `managed-agents-2026-04-01`).
// Dreams y MCP Tunnels se mencionan como research preview (Req 3.24), de nicho.
//
// Trazabilidad: Req 3.14, 3.24, 4.4, 5.4, 6.1-6.4, 9.1, 9.2, 9.5.
export const day20: Lesson = {
  day: 20,
  slug: "managed-agents-conceptos",
  title: "Managed agents: conceptos",
  section: "AVANZADO",
  estimatedMinutes: 25,
  icon: "concept-agentes",
  objectives: [
    "Explicar qué son los Claude Managed Agents y en qué se diferencian de construir tu propio bucle de agente sobre la Messages API",
    "Identificar los cuatro conceptos del modelo (Agent, Environment, Session y Events) y el flujo de trabajo que los conecta",
    "Decidir cuándo tiene sentido usar Managed Agents y reconocer que toda la superficie está en beta",
    "Situar Dreams y MCP Tunnels como research preview de acceso restringido, sin tratarlos como tema central",
  ],
  blocks: [
    {
      type: "callout",
      variant: "warning",
      text:
        "Toda la superficie de Claude Managed Agents está en BETA. Cada petición exige la cabecera beta managed-agents-2026-04-01, y el contrato puede cambiar con aviso. No construyas sobre esta API esperando las mismas garantías de estabilidad que ofrece la parte GA de la plataforma (Messages, Batches, Models, Files, Skills).",
    },
    {
      type: "paragraph",
      text:
        "La Messages API te da acceso directo de prompting al modelo: tú construyes el bucle de agente, orquestas la ejecución de herramientas y operas el runtime. Claude Managed Agents invierte ese reparto de trabajo. Es un arnés de agente preconstruido y configurable que corre en infraestructura gestionada por Anthropic, donde Claude puede leer archivos, ejecutar comandos, navegar la web y ejecutar código dentro de un sandbox seguro. El arnés incorpora caché de prompts, compaction y otras optimizaciones ya integradas.",
    },
    { type: "heading", level: 2, text: "Dos vías de construcción, dos casos" },
    {
      type: "paragraph",
      text:
        "No es que una sustituya a la otra. La documentación las plantea como herramientas para problemas distintos: control fino frente a trabajo de larga duración.",
    },
    {
      type: "comparison",
      lang: "ts",
      before: {
        title: "Messages API — tú orquestas",
        code:
          "// Tú mantienes el bucle: enviar mensaje,\n" +
          "// recibir tool_use, ejecutar la herramienta,\n" +
          "// devolver el resultado y repetir.\n" +
          "let messages = [{ role: 'user', content: tarea }];\n" +
          "while (true) {\n" +
          "  const r = await client.messages.create({\n" +
          "    model: 'claude-opus-5',\n" +
          "    max_tokens: 4096,\n" +
          "    tools,\n" +
          "    messages,\n" +
          "  });\n" +
          "  if (r.stop_reason !== 'tool_use') break;\n" +
          "  // ...ejecutas tú las herramientas y sigues el bucle\n" +
          "}",
      },
      after: {
        title: "Managed Agents — el arnés orquesta",
        code:
          "// Defines el agente una vez y lanzas una sesión.\n" +
          "// El historial, la ejecución de herramientas y el\n" +
          "// sandbox los gestiona el servidor.\n" +
          "const agent = await client.beta.agents.create({\n" +
          "  name: 'analista',\n" +
          "  model: 'claude-opus-5',\n" +
          "  system: 'Analizas reportes financieros.',\n" +
          "});\n" +
          "const session = await client.beta.sessions.create({\n" +
          "  agent_id: agent.id,\n" +
          "  environment_id: env.id,\n" +
          "});",
      },
    },
    { type: "heading", level: 2, text: "Los cuatro conceptos" },
    {
      type: "paragraph",
      text:
        "El modelo mental completo son cuatro piezas. Entenderlas y su relación es lo que evita confundir la configuración reutilizable (Agent) con la instancia en ejecución (Session).",
    },
    {
      type: "list",
      items: [
        "Agent: la configuración reutilizable y versionada. Reúne el modelo, el prompt de sistema, las herramientas, los servidores MCP y las skills. Se crea una vez y se referencia por ID desde múltiples sesiones.",
        "Environment: define dónde corren las sesiones. Puede ser un sandbox cloud gestionado por Anthropic o uno autoalojado en tu infraestructura (útil por cumplimiento o residencia de datos).",
        "Session: una instancia del agente en ejecución dentro de un entorno, realizando una tarea concreta y generando salidas. Es lo que tiene estado.",
        "Events: los mensajes intercambiados entre tu aplicación y el agente: turnos de usuario, resultados de herramienta y actualizaciones de estado. El historial completo se persiste del lado servidor.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Managed Agents", icon: "concept-agentes" },
        { service: "MCP connector", icon: "concept-mcp" },
        { service: "Arquitectura y buenas prácticas", icon: "concept-arquitectura" },
      ],
    },
    { type: "heading", level: 2, text: "El flujo de trabajo" },
    {
      type: "paragraph",
      text:
        "Las cuatro piezas se conectan en una secuencia estable: defines el agente, configuras el entorno, lanzas una sesión que los referencia y envías mensajes de usuario como eventos. Claude ejecuta herramientas de forma autónoma y transmite los resultados por SSE; puedes guiar o interrumpir enviando eventos adicionales a mitad de ejecución.",
    },
    {
      type: "code",
      lang: "bash",
      title: "Crear un agente con el CLI ant (cabecera beta obligatoria)",
      code:
        "# Toda petición de Managed Agents exige la cabecera beta.\n" +
        "curl https://api.anthropic.com/v1/agents \\\n" +
        "  -H \"x-api-key: $ANTHROPIC_API_KEY\" \\\n" +
        "  -H \"anthropic-version: 2023-06-01\" \\\n" +
        "  -H \"anthropic-beta: managed-agents-2026-04-01\" \\\n" +
        "  -H \"content-type: application/json\" \\\n" +
        "  -d '{\n" +
        "    \"name\": \"analista-financiero\",\n" +
        "    \"model\": \"claude-opus-5\",\n" +
        "    \"system\": \"Analizas reportes y resumes riesgos.\"\n" +
        "  }'",
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Ojo con las cabeceras beta: no hay una sola. Los memory stores usan agent-memory-2026-07-22 y NO deben combinarse con managed-agents-2026-04-01 en la misma petición (devuelve 400). Si tu código fija cabeceras beta explícitamente, hay que reemplazar, no añadir.",
    },
    { type: "heading", level: 2, text: "Cuándo tiene sentido" },
    {
      type: "paragraph",
      text:
        "Managed Agents brilla cuando la tarea es de larga duración o asíncrona y no quieres operar la infraestructura de agente tú mismo:",
    },
    {
      type: "list",
      items: [
        "Ejecución de larga duración: tareas de minutos u horas con múltiples llamadas a herramientas.",
        "Infraestructura mínima: sin necesidad de construir el bucle de agente, el sandbox ni la capa de ejecución de herramientas.",
        "Sesiones con estado: sistema de archivos e historial persistentes entre interacciones.",
        "Ejecución programada: corridas recurrentes por cron mediante scheduled deployments.",
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Managed Agents NO es elegible para Zero Data Retention ni para cobertura BAA de HIPAA. Es consecuencia directa del diseño: las sesiones son de larga duración, se reanudan tras pausas y almacenan historial, estado del sandbox y salidas del lado servidor. Puedes borrar sesiones y archivos por API en cualquier momento, pero la elegibilidad ZDR no es negociable aquí. Lo veremos en la lección de Zero Data Retention.",
    },
    { type: "heading", level: 3, text: "Research preview: Dreams y MCP Tunnels" },
    {
      type: "paragraph",
      text:
        "Dentro de la beta hay dos piezas de nicho en un research preview más limitado que exige solicitar acceso aparte. Las mencionamos para situarlas, no para profundizar. Dreams (cabecera dreaming-2026-04-21) es un trabajo asíncrono que lee un memory store y produce uno nuevo y reorganizado —duplicados fusionados, entradas obsoletas resueltas— sin modificar el store de entrada. MCP Tunnels resuelve la conexión a servidores MCP que no están expuestos públicamente en HTTP, la limitación del MCP connector directo.",
    },
    {
      type: "checklist",
      title: "Antes de adoptar Managed Agents",
      items: [
        "Asumo que es beta: cabecera managed-agents-2026-04-01 en cada petición y posibles cambios con aviso.",
        "Distingo Agent (config reutilizable y versionada) de Session (instancia con estado).",
        "Sé que el historial de eventos se persiste del lado servidor y que eso lo hace no elegible para ZDR.",
        "Dreams y MCP Tunnels los trato como research preview de acceso restringido, no como base de producción.",
      ],
    },
  ],
  selfCheck: [
    {
      question:
        "¿Cuál es la diferencia conceptual correcta entre un Agent y una Session en Claude Managed Agents?",
      options: [
        "Son sinónimos; la documentación usa ambos términos indistintamente",
        "El Agent es la configuración reutilizable y versionada (modelo, prompt, herramientas) y la Session es una instancia en ejecución con estado que lo referencia",
        "La Session define el modelo y el prompt, y el Agent es la copia efímera que corre en el sandbox",
        "El Agent corre en el cliente y la Session corre en Amazon Bedrock",
      ],
      correctIndex: 1,
      explanation:
        "El Agent reúne modelo, prompt de sistema, herramientas, servidores MCP y skills; se crea una vez y se referencia por ID. La Session es la instancia en ejecución dentro de un Environment, la que tiene estado (sistema de archivos e historial de eventos persistido del lado servidor).",
    },
    {
      question: "¿En qué estado de madurez está la superficie de Claude Managed Agents?",
      options: [
        "Generalmente disponible (GA), con las mismas garantías que la Messages API",
        "Beta: exige la cabecera managed-agents-2026-04-01 y su contrato puede cambiar con aviso",
        "Deprecada, reemplazada por la API legacy de Text Completions",
        "Research preview para todas sus funciones, incluidos Agents y Sessions",
      ],
      correctIndex: 1,
      explanation:
        "Managed Agents está en beta completa: cada petición requiere la cabecera managed-agents-2026-04-01. Dentro de esa beta, solo Dreams y MCP Tunnels están en un research preview más limitado que requiere solicitar acceso; Agents y Sessions no.",
    },
    {
      question:
        "Necesitas una tarea agéntica de varias horas, con estado persistente entre interacciones y sin montar tú el sandbox ni el bucle de ejecución de herramientas. ¿Qué encaja mejor?",
      options: [
        "La Messages API síncrona con un bucle propio de tool_use",
        "La API legacy de Text Completions",
        "Claude Managed Agents con una Session de larga duración",
        "La Message Batches API con 50 % de descuento",
      ],
      correctIndex: 2,
      explanation:
        "Managed Agents está pensado precisamente para ejecución de larga duración, sesiones con estado e infraestructura mínima. La Messages API te obligaría a orquestar el bucle y el runtime; Batches es para volumen asíncrono sin estado; Text Completions es legacy.",
    },
  ],
};
