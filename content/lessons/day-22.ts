import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 15.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-admin-detail.md (§1 Credenciales, §2 Tipos de
// Clave, §3 Roles, §4 Workspaces, §5 Inventario, §6 Usage y Cost).
// Terminología oficial. Req 3.15.
export const day22: Lesson = {
  day: 22,
  slug: "admin-api",
  title: "Admin API",
  section: "AVANZADO",
  estimatedMinutes: 28,
  icon: "concept-admin",
  objectives: [
    "Gestionar programáticamente la organización: workspaces, miembros, invitaciones, claves y grupos",
    "Elegir la credencial correcta: Admin API key frente a token OAuth org:admin para endpoints que lo exigen",
    "Distinguir los tipos de clave (personal, service account, workspace legacy) y por qué las de workspace son legacy",
    "Obtener datos de uso y coste con la Usage and Cost API como fuente autoritativa de conciliación",
  ],
  blocks: [
    {
      type: "callout",
      variant: "warning",
      text:
        "La Admin API está en BETA (los 136 endpoints de organization/* lo están) y NO está disponible para cuentas individuales: requiere una organización configurada. Se accede vía client.beta.organization en los SDKs o ant beta:organization en el CLI.",
    },
    {
      type: "paragraph",
      text:
        "La Admin API es la capa de gobierno de una organización: crea y gestiona workspaces, miembros, invitaciones, service accounts, grupos RBAC y claves, y da acceso programático a uso y coste. Es la herramienta para automatizar la provisión en lugar de hacerla a mano en la Console.",
    },
    { type: "heading", level: 2, text: "Credenciales: no todas sirven para todo" },
    {
      type: "list",
      items: [
        "Admin API key (empieza por sk-ant-admin…): se envía en x-api-key. Cubre la MAYORÍA de endpoints, pero no todos.",
        "Token OAuth Bearer con ámbito org:admin: obligatorio para service_accounts, federation/issuers y federation/rules.",
        "Clave personal o de service account no acotada a un workspace: hereda los permisos de la cuenta vinculada.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Admin API", icon: "concept-admin" },
        { service: "Workload Identity Federation", icon: "concept-identidad" },
        { service: "Compliance y gobernanza", icon: "concept-compliance" },
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Una Admin API key cubre casi todo, pero los endpoints de service account, federation issuer y federation rule aceptan ÚNICAMENTE un token OAuth con ámbito org:admin. Si una petición a esos recursos devuelve 403 con una Admin API key, esa es la causa.",
    },
    {
      type: "code",
      lang: "bash",
      title: "Obtener un token OAuth org:admin con el CLI ant",
      code:
        "ant auth login --profile admin --scope \"org:admin\"\n" +
        "export ANTHROPIC_AUTH_TOKEN=$(ant auth print-credentials --profile admin --access-token)\n" +
        "# Deja ANTHROPIC_API_KEY sin definir para que se use el token Bearer.\n" +
        "# Los tokens interactivos son de vida corta: si empiezan los 401, repite el export.",
      highlightLines: [1, 2],
    },
    { type: "heading", level: 2, text: "Tipos de clave" },
    {
      type: "paragraph",
      text:
        "Al crear una clave eliges su tipo, y eso determina qué puede hacer, dónde funciona y cuándo deja de funcionar. Hay tres, y la distinción clave es si está respaldada por identidad.",
    },
    {
      type: "list",
      items: [
        "Personal key: actúa como tú, con tus roles. Para tu propio desarrollo y scripts.",
        "Service account key: actúa como un service account. Para cargas compartidas o automatizadas (CI, producción).",
        "Workspace key (legacy): no representa a nadie, pertenece al workspace. Legacy precisamente porque no hay a quién auditar.",
      ],
    },
    {
      type: "quote",
      text:
        "Una clave de workspace ES una credencial; un service account TIENE credenciales. Eso hace mucho más fácil auditar qué carga actuó como qué identidad.",
      author: "Documentación de autenticación — Claude Developer Platform",
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Dos ausencias significativas de la Admin API: NO hay create de clave de API por API (solo listar, recuperar y actualizar), y rbac_roles es solo lectura. Ambas empujan la provisión inicial hacia la Console. Para cargas automatizadas, la vía preferida es Workload Identity Federation.",
    },
    { type: "heading", level: 2, text: "Usage y Cost API" },
    {
      type: "paragraph",
      text:
        "Da acceso granular a datos históricos de uso y coste de la organización, los mismos de las páginas Usage y Cost de la Console. Su valor principal: los conteos de la Usage API son la fuente autoritativa para conciliación contable, en lugar de depender solo del usage de las respuestas individuales, que sirve para control en tiempo real.",
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "En Claude Platform on AWS los endpoints programáticos de Usage y Cost NO están disponibles: hay que consultar las páginas de la Console. Y en Claude Platform on AWS la Admin API se reduce a los endpoints de workspace y de external key (CMEK); no hay miembros, invitaciones ni informes.",
    },
    {
      type: "checklist",
      title: "Checklist de Admin API",
      items: [
        "Tengo una organización configurada (no cuenta individual) y asumo que es beta.",
        "Uso Admin API key para la mayoría, y token OAuth org:admin para service_accounts y federation.",
        "Elijo tipo de clave por identidad: personal para mí, service account para cargas compartidas.",
        "Provisiono claves y roles iniciales en la Console (no hay create por API; rbac_roles es solo lectura).",
        "Uso la Usage and Cost API como fuente autoritativa para conciliación.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Qué credencial se necesita obligatoriamente para los endpoints de service accounts y federation de la Admin API?",
      options: [
        "Cualquier Admin API key (sk-ant-admin…)",
        "Un token OAuth Bearer con ámbito org:admin; esos endpoints no aceptan una Admin API key",
        "Una clave de workspace legacy",
        "La Compliance Access Key de claude.ai",
      ],
      correctIndex: 1,
      explanation:
        "Una Admin API key cubre la mayoría de endpoints, pero service_accounts, federation/issuers y federation/rules aceptan únicamente un token OAuth con ámbito org:admin. Usar una Admin API key en esos recursos no funciona.",
    },
    {
      question: "¿Por qué las claves de workspace se consideran legacy frente a las personales o de service account?",
      options: [
        "Porque son más lentas",
        "Porque una clave de workspace no representa a nadie (es una credencial sin identidad detrás), mientras que personal y service account están respaldadas por identidad y son auditables",
        "Porque solo funcionan en Amazon Bedrock",
        "Porque caducan en 3 horas siempre",
      ],
      correctIndex: 1,
      explanation:
        "Las claves personales y de service account están respaldadas por identidad: cada petición actúa como un usuario o service account que la organización gestiona, y dejan de funcionar cuando esa identidad se retira. Una clave de workspace no representa a nadie, así que no hay a quién auditar: por eso es legacy.",
    },
    {
      question: "Para conciliar los costes reales de tu organización con la facturación de Anthropic, ¿cuál es la fuente autoritativa?",
      options: [
        "El campo usage de cada respuesta individual de la Messages API",
        "La Usage and Cost API de la Admin API, cuyos conteos son la fuente autoritativa para conciliación contable",
        "Un promedio estimado de tokens por petición",
        "No existe forma programática de obtener costes",
      ],
      correctIndex: 1,
      explanation:
        "La Usage and Cost API da los conteos autoritativos para conciliación contable. El usage de las respuestas individuales sirve para control en tiempo real, no para cuadrar con la facturación. En Claude Platform on AWS esos endpoints no están disponibles y hay que usar la Console.",
    },
  ],
};
