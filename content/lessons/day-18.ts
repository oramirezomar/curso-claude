import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 15.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-tools-detail.md (§7 Agent Skills).
// Terminología oficial. Req 3.12.
export const day18: Lesson = {
  day: 18,
  slug: "agent-skills",
  title: "Agent Skills",
  section: "AVANZADO",
  estimatedMinutes: 28,
  icon: "concept-skills",
  objectives: [
    "Entender qué es una Agent Skill: una carpeta con SKILL.md, instrucciones y recursos que Claude carga bajo demanda",
    "Explicar la divulgación progresiva en tres niveles y por qué puedes instalar muchas Skills sin penalización de contexto",
    "Escribir un campo description que diga qué hace la Skill Y cuándo usarla, porque es el disparador de activación",
    "Crear una Skill con la Skills API (form-data con un SKILL.md en la raíz)",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Una Agent Skill es una capacidad modular basada en sistema de archivos. Cada Skill empaqueta instrucciones, metadatos y recursos opcionales (scripts, plantillas) que Claude usa automáticamente cuando son relevantes. Frente a un prompt —una instrucción puntual que repites en cada conversación— una Skill se carga bajo demanda: es la diferencia entre configurar un especialista y explicarle lo mismo cada vez.",
    },
    { type: "heading", level: 2, text: "Divulgación progresiva en tres niveles" },
    {
      type: "paragraph",
      text:
        "Es el mecanismo central y la razón por la que puedes instalar muchas Skills sin penalización. Una Skill tiene hasta tres niveles de contenido, cada uno cargado en un momento distinto:",
    },
    {
      type: "list",
      items: [
        "Nivel 1 (Metadatos): siempre, al arrancar. ~100 tokens por Skill: name y description del frontmatter YAML.",
        "Nivel 2 (Instrucciones): cuando la Skill se activa. Menos de 5 000 tokens: el cuerpo de SKILL.md.",
        "Nivel 3+ (Recursos): según se necesiten. Ningún coste hasta que se accede: archivos de referencia (entran al leerse) y scripts (se ejecutan por bash; solo su salida entra en contexto).",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Agent Skills", icon: "concept-skills" },
        { service: "Managed Agents", icon: "concept-agentes" },
        { service: "Zero Data Retention", icon: "concept-seguridad" },
      ],
    },
    {
      type: "callout",
      variant: "success",
      text:
        "La consecuencia práctica: puedes instalar muchas Skills sin penalización de contexto. Hasta que una se activa, solo su nombre y descripción (unos 100 tokens) ocupan espacio. Y cuando Claude ejecuta un script de la Skill, el código del script nunca entra en contexto: solo su salida consume tokens.",
    },
    { type: "heading", level: 2, text: "El description es el disparador" },
    {
      type: "paragraph",
      text:
        "Claude carga los metadatos al arrancar y los incluye en el prompt de sistema. El description es lo que Claude compara con tu petición para decidir si activa la Skill. Por eso tiene que decir dos cosas: qué hace la Skill y cuándo usarla. Una descripción que solo diga qué hace fallará al activarse.",
    },
    {
      type: "code",
      lang: "text",
      title: "Estructura en disco y frontmatter de SKILL.md",
      code:
        "pdf-processing/\n" +
        "├── SKILL.md          # instrucciones principales (nivel 2)\n" +
        "├── FORMS.md          # guía especializada (nivel 3)\n" +
        "├── REFERENCE.md      # referencia detallada (nivel 3)\n" +
        "└── scripts/\n" +
        "    └── fill_form.py  # script ejecutable (nivel 3)\n" +
        "\n" +
        "--- frontmatter de SKILL.md ---\n" +
        "name: pdf-processing\n" +
        "description: Extrae texto y tablas de PDFs, rellena formularios, fusiona\n" +
        "  documentos. Usar al trabajar con archivos PDF o cuando el usuario\n" +
        "  mencione PDFs, formularios o extracción de documentos.",
      highlightLines: [10, 11, 12],
    },
    { type: "heading", level: 2, text: "Crear una Skill con la Skills API" },
    {
      type: "paragraph",
      text:
        "POST /v1/skills acepta form-data, no JSON. El campo files lleva los archivos a subir: todos deben estar en el mismo directorio de primer nivel, con un SKILL.md en la raíz de ese directorio. El display_name es una etiqueta legible de una línea; si se omite, se deriva del name del frontmatter, y no es único.",
    },
    {
      type: "code",
      lang: "bash",
      title: "Subir una Skill (form-data)",
      code:
        "curl https://api.anthropic.com/v1/skills \\\n" +
        "  -H \"Authorization: Bearer $ANTHROPIC_API_KEY\" \\\n" +
        "  -H \"anthropic-version: 2023-06-01\" \\\n" +
        "  -F \"files=@pdf-processing/SKILL.md\" \\\n" +
        "  -F \"files=@pdf-processing/FORMS.md\" \\\n" +
        "  -F \"files=@pdf-processing/scripts/fill_form.py\" \\\n" +
        "  -F \"display_name=Procesamiento de PDF\"",
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Agent Skills NO es elegible para Zero Data Retention: las skills se almacenan como recursos reutilizables, fuera del turno de la petición. En un entorno con ZDR estricto, quedan descartadas. Las Skills prefabricadas (PowerPoint, Excel, Word, PDF) y las personalizadas comparten esa condición.",
    },
    {
      type: "checklist",
      title: "Checklist de Agent Skills",
      items: [
        "El description dice qué hace la Skill Y cuándo usarla (es el disparador).",
        "Pongo el detalle extenso en archivos de nivel 3 que no cuestan contexto hasta leerse.",
        "Uso scripts para trabajo determinista: solo su salida consume tokens.",
        "Incluyo un SKILL.md en la raíz del directorio al subir por la Skills API (form-data).",
        "Si el requisito es ZDR, descarto Agent Skills.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Por qué puedes instalar muchas Agent Skills sin penalización de contexto?",
      options: [
        "Porque las Skills no consumen tokens nunca",
        "Por la divulgación progresiva: hasta que una Skill se activa, solo su nivel 1 (name y description, ~100 tokens) ocupa espacio; las instrucciones y recursos se cargan bajo demanda",
        "Porque Claude comprime las Skills automáticamente",
        "Porque las Skills se ejecutan en Amazon Bedrock",
      ],
      correctIndex: 1,
      explanation:
        "La divulgación progresiva carga tres niveles en momentos distintos: metadatos siempre (~100 tokens), instrucciones al activarse (cuerpo de SKILL.md) y recursos según se necesiten (coste cero hasta acceder). Por eso instalar muchas Skills no penaliza el contexto hasta que una se activa.",
    },
    {
      question: "¿Qué debe contener el campo description de una Skill para que se active correctamente?",
      options: [
        "Solo qué hace la Skill",
        "Qué hace la Skill Y cuándo usarla; una descripción que solo diga qué hace fallará al activarse",
        "El código completo de los scripts",
        "La lista de todos los archivos de nivel 3",
      ],
      correctIndex: 1,
      explanation:
        "Claude compara el description con tu petición para decidir si activa la Skill, así que debe decir dos cosas: qué hace y cuándo usarla. Una descripción que solo diga qué hace, sin el cuándo, fallará al activarse porque el modelo no sabrá reconocer la situación.",
    },
    {
      question: "Al crear una Skill con POST /v1/skills, ¿qué requisito tienen los archivos?",
      options: [
        "Deben enviarse como JSON en el cuerpo",
        "Se envían como form-data; todos en el mismo directorio de primer nivel, con un SKILL.md en la raíz de ese directorio",
        "Debe haber exactamente un archivo .py",
        "No se permiten subcarpetas de ningún tipo",
      ],
      correctIndex: 1,
      explanation:
        "POST /v1/skills acepta form-data (no JSON). El campo files exige que todos los archivos estén en el mismo directorio de primer nivel y que haya un SKILL.md en la raíz de ese directorio. El display_name, si se omite, se deriva del name del frontmatter.",
    },
  ],
};
