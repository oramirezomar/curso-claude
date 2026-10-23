import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 14.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-tools-detail.md (§4 Herramientas de Servidor,
// advisor). Terminología oficial. Req 3.10, 3.20.
export const day14: Lesson = {
  day: 14,
  slug: "herramientas-servidor-advisor",
  title: "Herramientas de servidor y advisor",
  section: "MEDIO",
  estimatedMinutes: 28,
  icon: "concept-herramientas-servidor",
  objectives: [
    "Distinguir las herramientas de servidor (las ejecuta Anthropic) de las de cliente (las ejecutas tú)",
    "Configurar web search y web fetch con listas de dominios, max_uses y control de coste",
    "Reconocer que code execution es gratuita junto a web search/fetch pero no es elegible para ZDR",
    "Situar la advisor tool como feature beta que aporta guía estratégica a mitad de generación",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "A diferencia de las herramientas de cliente, las herramientas de servidor las ejecuta Anthropic: el modelo emite un server_tool_use y el resultado llega directamente en la respuesta, sin ida y vuelta por tu código. Esto simplifica mucho capacidades como buscar en la web o ejecutar código, a cambio de ceder el control de la ejecución.",
    },
    { type: "heading", level: 2, text: "Web search y web fetch" },
    {
      type: "paragraph",
      text:
        "Web search busca en la web y web fetch recupera el contenido de URLs concretas. Ambas se configuran con listas de dominios y techos de uso. El name que emite el modelo es web_search y web_fetch respectivamente; las versiones son fechadas.",
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Herramientas de servidor", icon: "concept-herramientas-servidor" },
        { service: "Tool use", icon: "concept-herramientas" },
        { service: "Compliance y gobernanza", icon: "concept-compliance" },
      ],
    },
    {
      type: "list",
      items: [
        "allowed_domains / blocked_domains: lista blanca o negra de dominios.",
        "max_uses: techo de invocaciones por petición.",
        "response_inclusion (full / excluded): si el contenido recuperado entra en la respuesta o se excluye.",
        "web fetch añade citations y max_content_tokens (su control de coste principal).",
      ],
    },
    {
      type: "code",
      lang: "json",
      title: "web search restringido a dominios y con techo de uso",
      code:
        "{\n" +
        "  \"tools\": [\n" +
        "    {\n" +
        "      \"type\": \"web_search_20260318\",\n" +
        "      \"name\": \"web_search\",\n" +
        "      \"allowed_domains\": [\"docs.ejemplo.com\", \"status.ejemplo.com\"],\n" +
        "      \"max_uses\": 5\n" +
        "    }\n" +
        "  ]\n" +
        "}",
      highlightLines: [6, 7],
    },
    { type: "heading", level: 2, text: "Code execution" },
    {
      type: "paragraph",
      text:
        "Code execution (name code_execution) ejecuta código en un entorno aislado para análisis de datos, cálculos y procesado de archivos. No tiene campos de configuración propios más allá de los comunes, y tiene una variante cifrada de resultado.",
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Dos datos clave de code execution: es gratuita cuando se usa junto a web search o web fetch, según la matriz de features. Pero NO es elegible para Zero Data Retention, porque mantiene estado de ejecución fuera del turno. En un entorno con ZDR estricto, queda descartada.",
    },
    { type: "heading", level: 2, text: "La advisor tool (beta)" },
    {
      type: "callout",
      variant: "warning",
      text:
        "La advisor tool está en BETA y solo disponible en Claude API y Claude Platform on AWS. No la uses esperando las garantías de estabilidad de la parte GA de la plataforma.",
    },
    {
      type: "paragraph",
      text:
        "La advisor tool empareja un modelo ejecutor más rápido con un modelo asesor de mayor inteligencia que aporta guía estratégica a mitad de generación. Está pensada para cargas agénticas de horizonte largo: el ejecutor avanza rápido en el trabajo táctico, y el asesor interviene con dirección de alto nivel cuando conviene. Es una forma de combinar velocidad y profundidad sin pagar el modelo más caro en cada token.",
    },
    {
      type: "quote",
      text:
        "El asesor aporta guía estratégica a mitad de generación, no al final: corrige el rumbo mientras el ejecutor trabaja.",
      author: "Documentación de la advisor tool — Claude Developer Platform",
    },
    {
      type: "checklist",
      title: "Checklist de herramientas de servidor",
      items: [
        "Sé que las herramientas de servidor las ejecuta Anthropic; no hay tool_result que devolver.",
        "Restrinjo web search/fetch con allowed_domains y max_uses.",
        "Controlo el coste de web fetch con max_content_tokens.",
        "Recuerdo que code execution es gratis junto a web search/fetch pero no es elegible para ZDR.",
        "Trato la advisor tool como beta: solo Claude API y Claude Platform on AWS.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Cuál es la diferencia fundamental entre una herramienta de servidor y una de cliente?",
      options: [
        "Ninguna; son nombres distintos para lo mismo",
        "Las de servidor las ejecuta Anthropic y el resultado llega en la respuesta; las de cliente las ejecutas tú devolviendo un tool_result",
        "Las de servidor solo funcionan en streaming",
        "Las de cliente son siempre beta y las de servidor siempre GA",
      ],
      correctIndex: 1,
      explanation:
        "Las herramientas de servidor las ejecuta Anthropic: el modelo emite server_tool_use y el resultado llega directamente en la respuesta, sin ida y vuelta por tu código. Las de cliente las ejecutas tú: el modelo emite tool_use y tu código devuelve el tool_result.",
    },
    {
      question: "¿Qué es cierto sobre code execution?",
      options: [
        "Es gratuita siempre y elegible para ZDR",
        "Es gratuita cuando se usa junto a web search o web fetch, pero NO es elegible para ZDR",
        "Tiene un coste fijo por invocación y es elegible para ZDR",
        "Solo está disponible en Amazon Bedrock",
      ],
      correctIndex: 1,
      explanation:
        "Según la matriz de features, code execution es gratuita cuando se usa junto a web search o web fetch, pero no es elegible para Zero Data Retention porque mantiene estado de ejecución fuera del turno de la petición.",
    },
    {
      question: "¿Qué hace la advisor tool y en qué estado de madurez está?",
      options: [
        "Es una herramienta GA que ejecuta código Python",
        "Está en beta (Claude API y Claude Platform on AWS) y empareja un ejecutor rápido con un asesor de mayor inteligencia que guía a mitad de generación",
        "Es un sustituto de web search ya generalmente disponible",
        "Es una herramienta de cliente que tú ejecutas",
      ],
      correctIndex: 1,
      explanation:
        "La advisor tool está en beta y solo en Claude API y Claude Platform on AWS. Empareja un modelo ejecutor más rápido con un modelo asesor de mayor inteligencia que aporta guía estratégica a mitad de generación, para cargas agénticas de horizonte largo.",
    },
  ],
};
