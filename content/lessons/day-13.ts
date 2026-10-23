import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 14.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-tools-detail.md (§3 Herramientas de Cliente,
// §5 Toolsets). Terminología oficial. Req 3.10, 3.19.
export const day13: Lesson = {
  day: 13,
  slug: "herramientas-cliente-toolsets",
  title: "Herramientas de cliente y toolsets",
  section: "MEDIO",
  estimatedMinutes: 30,
  icon: "concept-herramientas-cliente",
  objectives: [
    "Declarar herramientas de cliente prefabricadas (bash, text editor, memory) que tú ejecutas",
    "Entender que computer use y browser use ya no son herramientas sueltas sino toolsets versionados",
    "Configurar el control fino de un toolset de navegador por operación (p. ej. deshabilitar la ejecución de JavaScript)",
    "Leer el bloque browser_state como inventario completo de pestañas, no como un delta",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Las herramientas de cliente se declaran en el array tools pero las ejecutas tú: el modelo emite un tool_use y tu código devuelve el tool_result. Anthropic publica varias prefabricadas con contrato conocido, y agrupa las capacidades complejas (ordenador y navegador) en toolsets. Profundizamos especialmente en computer use y browser use.",
    },
    { type: "heading", level: 2, text: "Herramientas de cliente prefabricadas" },
    {
      type: "list",
      items: [
        "Bash (bash_20250124): el modelo invoca con name \"bash\" para ejecutar comandos de shell que corres tú.",
        "Text editor (text_editor_20250124 / _20250429 / _20250728): name \"str_replace_based_edit_tool\". Campo propio max_characters.",
        "Memory (memory_20250818): name \"memory\".",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Herramientas de cliente y toolsets", icon: "concept-herramientas-cliente" },
        { service: "Tool use", icon: "concept-herramientas" },
        { service: "Tool search", icon: "concept-herramientas-servidor" },
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "El name del editor de texto (str_replace_based_edit_tool) NO coincide con el nombre de su tipo. Es la clase de detalle que rompe un router de herramientas escrito a partir del nombre del tipo. Además las versiones son fechadas y coexisten: cambiar de text_editor_20250429 a _20250728 puede cambiar el conjunto de comandos que el modelo emite.",
    },
    { type: "heading", level: 2, text: "Toolsets: computer use y browser use" },
    {
      type: "paragraph",
      text:
        "Computer use y browser use ya no se declaran como herramientas individuales, sino como toolsets: un solo elemento de tools que agrupa muchas operaciones relacionadas. El modelo invoca miembros individuales del conjunto, no el conjunto entero, y por eso los toolsets no llevan campo name.",
    },
    {
      type: "list",
      items: [
        "Browser toolset (browser_toolset_20260801): operar un navegador. Campos configs y cache_control.",
        "Computer toolset (computer_toolset_20260801): controlar un ordenador (pantalla, teclado, ratón). Campos configs y cache_control.",
      ],
    },
    {
      type: "paragraph",
      text:
        "La granularidad del toolset de navegador es alta: cada operación tiene su propia configuración (clic, doble clic, arrastre, pulsación de tecla, subida de archivo, lectura de texto de página, ejecución de JavaScript, etc.). Eso permite control fino: por ejemplo, deshabilitar la ejecución de JavaScript del navegador manteniendo el resto de operaciones.",
    },
    {
      type: "code",
      lang: "json",
      title: "Toolset de navegador con una operación deshabilitada",
      code:
        "{\n" +
        "  \"tools\": [\n" +
        "    {\n" +
        "      \"type\": \"browser_toolset_20260801\",\n" +
        "      \"configs\": {\n" +
        "        \"javascript_exec\": { \"enabled\": false }\n" +
        "      }\n" +
        "    }\n" +
        "  ]\n" +
        "}",
      highlightLines: [4, 5, 6],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Que cada operación tenga configuración propia es la base del principio de mínimo privilegio aplicado al navegador: en un entorno regulado como Open Finance, puedes permitir que el modelo lea páginas y rellene formularios pero no ejecute JavaScript arbitrario, reduciendo la superficie de riesgo.",
    },
    { type: "heading", level: 2, text: "El bloque browser_state" },
    {
      type: "paragraph",
      text:
        "Tras una llamada de un miembro del toolset de navegador, tu tool_result puede incluir un bloque browser_state que reporta el estado del navegador: el inventario completo de pestañas abiertas, cuál está activa, y los efectos secundarios de la llamada.",
    },
    {
      type: "list",
      items: [
        "Como máximo uno por tool_result, y solo en un resultado no de error que responda a un tool_use del toolset de navegador.",
        "Campo tabs: es el inventario COMPLETO, no un delta. Puede estar vacío; si no, exactamente una entrada lleva active true.",
        "El servidor renderiza el texto que ve el modelo a partir de este bloque: el modelo nunca ve los campos crudos.",
      ],
    },
    {
      type: "checklist",
      title: "Checklist de herramientas de cliente",
      items: [
        "Enruto por el name real que emite el modelo, no por el nombre del tipo.",
        "Fijo una versión concreta de herramienta y la trato como parte del contrato.",
        "Declaro computer use y browser use como toolsets, no como herramientas sueltas.",
        "Deshabilito operaciones peligrosas (p. ej. JavaScript) cuando el entorno lo exige.",
        "Trato browser_state como inventario completo de pestañas, no como un delta.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Por qué computer use y browser use se declaran como toolsets y no como herramientas individuales?",
      options: [
        "Porque son herramientas de servidor que ejecuta Anthropic",
        "Porque agrupan muchas operaciones relacionadas bajo un solo elemento de tools; el modelo invoca miembros individuales y por eso el toolset no lleva name",
        "Porque están deprecadas",
        "Porque solo funcionan en Amazon Bedrock",
      ],
      correctIndex: 1,
      explanation:
        "Computer use y browser use son toolsets: un solo elemento de tools que agrupa muchas operaciones. El modelo invoca miembros individuales del conjunto (clic, escribir, leer página...), no el conjunto entero, y por eso los toolsets no llevan campo name.",
    },
    {
      question: "¿Qué permite la configuración por operación del toolset de navegador?",
      options: [
        "Cambiar el modelo a mitad de sesión",
        "Control fino: por ejemplo deshabilitar la ejecución de JavaScript manteniendo el resto de operaciones disponibles",
        "Convertir el navegador en una herramienta de servidor",
        "Saltarse la cabecera anthropic-version",
      ],
      correctIndex: 1,
      explanation:
        "Cada operación del toolset de navegador tiene su propia configuración, lo que permite control fino: se puede deshabilitar, por ejemplo, la ejecución de JavaScript y mantener el resto. Es el principio de mínimo privilegio aplicado al navegador, útil en entornos regulados.",
    },
    {
      question: "El bloque browser_state que incluyes en un tool_result, ¿qué representa su campo tabs?",
      options: [
        "Un delta con solo las pestañas que cambiaron",
        "El inventario completo de pestañas abiertas; si no está vacío, exactamente una lleva active true",
        "Un identificador de sesión del navegador",
        "El historial de navegación del usuario",
      ],
      correctIndex: 1,
      explanation:
        "El campo tabs de browser_state es el inventario completo de pestañas, no un delta. Puede estar vacío; si no lo está, exactamente una entrada lleva active true. El servidor renderiza el texto que ve el modelo a partir de este bloque, y el modelo nunca ve los campos crudos.",
    },
  ],
};
