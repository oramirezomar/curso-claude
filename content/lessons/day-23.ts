import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 15.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-admin-detail.md (§9 Workload Identity
// Federation). Terminología oficial. Req 3.16.
export const day23: Lesson = {
  day: 23,
  slug: "workload-identity-federation",
  title: "Workload Identity Federation",
  section: "AVANZADO",
  estimatedMinutes: 28,
  icon: "concept-identidad",
  objectives: [
    "Entender cómo WIF reemplaza claves estáticas de vida larga por tokens OIDC de vida corta",
    "Configurar los tres recursos: service account, federation issuer y federation rule",
    "Interpretar el intercambio: un JWT firmado por tu IdP se valida y devuelve un token de Anthropic de vida corta",
    "Reconocer cuándo usar WIF (cargas automatizadas: CI, clústeres, servicios de producción)",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Las claves sk-ant-… de vida larga son un pasivo de seguridad: si se filtran, funcionan hasta que alguien las revoca. Workload Identity Federation (WIF) permite que tus cargas de trabajo se autentiquen con tokens OIDC de vida corta en su lugar. Es la vía preferida para cargas automatizadas en un entorno serio.",
    },
    { type: "heading", level: 2, text: "Cómo funciona el intercambio" },
    {
      type: "paragraph",
      text:
        "Tu carga presenta un JWT firmado por tu proveedor de identidad (GitHub Actions, un clúster EKS, etc.). Anthropic lo valida contra reglas de confianza que configuras en la Console y devuelve un token de acceso de Anthropic de vida corta, ligado a un ámbito. Ese token, que expira en minutos, es el que usas en Authorization: Bearer.",
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Workload Identity Federation", icon: "concept-identidad" },
        { service: "Autenticación y versionado", icon: "concept-auth" },
        { service: "Admin API", icon: "concept-admin" },
      ],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "La propia documentación es honesta: WIF refuerza tu postura de seguridad reemplazando claves estáticas por tokens que expiran en minutos en lugar de nunca, pero no es una historia de seguridad completa por sí misma. Es una pieza, no la solución entera.",
    },
    { type: "heading", level: 2, text: "Los tres recursos" },
    {
      type: "paragraph",
      text:
        "Hay que configurar tres cosas antes de que una carga pueda federar. Juntas expresan una frase: \"los tokens firmados por el emisor X, con claims que se parecen a Y, pueden actuar como el service account Z\".",
    },
    {
      type: "list",
      items: [
        "Service account (svac_…): identidad no humana con nombre dentro de tu organización. Es el principal como el que actúa el token federado.",
        "Federation issuer (fdis_…): registra un proveedor OIDC. Lleva la Issuer URL (el claim iss exacto del JWT) y la JWKS source (cómo obtiene Anthropic las claves públicas; discovery por defecto).",
        "Federation rule (fdrl_…): el puente entre emisor y service account. Tiene match (condiciones del JWT), target (el service account) y authorization (el scope OAuth, por defecto workspace:developer).",
      ],
    },
    {
      type: "code",
      lang: "bash",
      title: "Intercambio de un JWT por un token de acceso de Anthropic",
      code:
        "# La carga obtiene su JWT del IdP (p. ej. GitHub Actions) y lo intercambia.\n" +
        "curl https://api.anthropic.com/v1/oauth/token \\\n" +
        "  -H \"content-type: application/json\" \\\n" +
        "  -d '{\n" +
        "    \"grant_type\": \"urn:ietf:params:oauth:grant-type:token-exchange\",\n" +
        "    \"subject_token\": \"<JWT firmado por tu IdP>\",\n" +
        "    \"rule_id\": \"fdrl_...\"\n" +
        "  }'\n" +
        "# Respuesta: un access_token de Anthropic de vida corta para Authorization: Bearer.",
      highlightLines: [5, 7],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Restricciones de las URLs que Anthropic consulta (Issuer URL, JWKS): deben ser https, en puerto 443, y usar un hostname DNS público que resuelva a IPs públicas. NO se aceptan literales de IP. Estas restricciones aplican solo a las URLs que Anthropic obtiene.",
    },
    {
      type: "paragraph",
      text:
        "Lo típico es un emisor por entorno: el clúster EKS de producción, el de staging y GitHub Actions son tres emisores distintos. Un emisor puede tener muchas reglas (una por equipo, namespace o nivel de permiso), y las reglas se evalúan por ID: el cliente especifica qué regla usar en la petición de intercambio, de modo que no hay resolución ambigua entre reglas que podrían coincidir.",
    },
    {
      type: "callout",
      variant: "info",
      text:
        "El default del scope es workspace:developer, que concede el mismo acceso que una clave de workspace. Algunos productos fijan el ámbito al crear la regla. También se define la vida del token en la regla. Recuerda: los endpoints de federation requieren un token OAuth org:admin, no una Admin API key.",
    },
    {
      type: "checklist",
      title: "Checklist de WIF",
      items: [
        "Uso WIF para cargas automatizadas (CI, clústeres, producción), no claves estáticas.",
        "Configuré service account, federation issuer y federation rule.",
        "La Issuer URL y JWKS son https, puerto 443, hostname DNS público (sin IPs literales).",
        "El cliente especifica el rule_id en el intercambio para evitar ambigüedad.",
        "Reviso el scope de la regla (por defecto workspace:developer) y la vida del token.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Cuál es la ventaja de seguridad principal de Workload Identity Federation frente a las claves sk-ant-…?",
      options: [
        "Hace las peticiones más rápidas",
        "Reemplaza claves estáticas de vida larga por tokens OIDC de vida corta que expiran en minutos, limitando el impacto de una filtración",
        "Elimina la necesidad de la cabecera anthropic-version",
        "Permite usar la API sin organización",
      ],
      correctIndex: 1,
      explanation:
        "WIF permite que las cargas se autentiquen con tokens de vida corta en lugar de claves estáticas que no expiran nunca. Si un token se filtra, caduca en minutos. La propia documentación aclara que refuerza la postura de seguridad pero no es una historia completa por sí sola.",
    },
    {
      question: "¿Qué tres recursos hay que configurar para WIF y qué expresan juntos?",
      options: [
        "Workspace, clave y webhook; expresan un presupuesto",
        "Service account, federation issuer y federation rule; expresan que tokens firmados por el emisor X con ciertos claims pueden actuar como el service account Z",
        "Agent, environment y session; expresan un flujo de agente",
        "Issuer, vault y tunnel; expresan una conexión MCP",
      ],
      correctIndex: 1,
      explanation:
        "Los tres recursos son service account (la identidad como la que se actúa), federation issuer (registra el proveedor OIDC con su Issuer URL y JWKS) y federation rule (el puente con match, target y authorization). Juntos expresan: tokens del emisor X con claims Y pueden actuar como el service account Z.",
    },
    {
      question: "Al configurar la Issuer URL o la JWKS source, ¿qué restricción imponen las URLs que Anthropic consulta?",
      options: [
        "Pueden ser http en cualquier puerto",
        "Deben ser https, en puerto 443, con hostname DNS público que resuelva a IPs públicas; no se aceptan literales de IP",
        "Deben apuntar a una IP privada del clúster",
        "No hay restricciones",
      ],
      correctIndex: 1,
      explanation:
        "Las URLs que Anthropic obtiene (Issuer URL, JWKS) deben ser https, en puerto 443, y usar un hostname DNS público que resuelva a IPs públicas. No se aceptan literales de IP. Estas restricciones aplican solo a las URLs que Anthropic consulta para verificar firmas.",
    },
  ],
};
