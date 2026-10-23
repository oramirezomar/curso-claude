import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 13.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-reference-claude-com.md (§2 Ciclo de Vida y
// Deprecaciones, §12 Niveles de Estabilidad). Terminología oficial. Req 3.2.
export const day02: Lesson = {
  day: 2,
  slug: "ciclo-de-vida-modelos",
  title: "Ciclo de vida de los modelos",
  section: "BÁSICO",
  estimatedMinutes: 20,
  icon: "concept-ciclo-vida",
  objectives: [
    "Distinguir los tres estados del ciclo de vida de un modelo: activo, deprecado y retirado",
    "Interpretar la fecha de retiro \"no antes de\" como un compromiso mínimo, no un calendario de LTS fijo",
    "Leer las rutas de migración publicadas y planificar el reemplazo de un modelo deprecado",
    "Entender por qué Amazon Bedrock y Google Cloud fijan fechas distintas de las plataformas operadas por Anthropic",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "Un modelo no vive para siempre. Cada modelo de la Claude Developer Platform recorre un ciclo de vida con tres estados, y entender ese ciclo es lo que evita que una aplicación en producción se rompa el día que un modelo deja de responder. A diferencia de un framework con un calendario de LTS de ventanas fijas, aquí cada modelo recibe su propia fecha de retiro anunciada como compromiso mínimo.",
    },
    { type: "heading", level: 2, text: "Los tres estados" },
    {
      type: "list",
      items: [
        "Activo: el modelo está disponible y recomendado. No tiene fecha de deprecación anunciada, solo una fecha de retiro tentativa \"no antes de\".",
        "Deprecado: el modelo sigue funcionando pero ya no se recomienda. Anthropic publica una ruta de migración y un plazo de eliminación.",
        "Retirado: el modelo ya no está disponible. Las peticiones que lo usen fallan.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Ciclo de vida de modelos", icon: "concept-ciclo-vida" },
        { service: "Modelos y precios", icon: "concept-modelos" },
        { service: "Plataformas cloud", icon: "concept-plataformas" },
      ],
    },
    { type: "heading", level: 2, text: "La fecha \"no antes de\"" },
    {
      type: "paragraph",
      text:
        "Cada modelo activo publica una fecha de retiro tentativa con la fórmula \"no antes de\". Es un compromiso mínimo: Anthropic no retirará el modelo antes de esa fecha, pero puede mantenerlo más tiempo. Son fechas reales que conviene anotar al elegir un modelo para producción.",
    },
    {
      type: "code",
      lang: "text",
      title: "Fechas de retiro tentativas de los modelos activos",
      code:
        "Modelo             Retiro no antes de\n-----------------  ------------------\nclaude-fable-5-1   1 sep 2027\nclaude-opus-5      24 jul 2027\nclaude-sonnet-5    30 jun 2027\nclaude-haiku-4-5   15 oct 2026",
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Haiku 4.5 es el modelo activo con la fecha de retiro más próxima (no antes del 15 oct 2026). Si construyes sobre el modelo más rápido por coste, planifica la migración con antelación: la fecha más cercana es también la que más vigilancia exige.",
    },
    { type: "heading", level: 2, text: "Rutas de migración" },
    {
      type: "paragraph",
      text:
        "Cuando un modelo se deprecia, la documentación publica el reemplazo recomendado. Estas son algunas rutas ya publicadas, que ilustran el patrón: un modelo retirado siempre apunta a un sucesor activo de la misma familia o superior.",
    },
    {
      type: "list",
      items: [
        "claude-opus-4-1 (deprecado 5 jun 2026, retirado 5 ago 2026) → claude-opus-4-8",
        "claude-sonnet-4 (deprecado 14 abr 2026) → claude-sonnet-4-6",
        "claude-3-7-sonnet (deprecado 28 oct 2025) → claude-sonnet-4-6",
        "claude-3-5-haiku (deprecado 19 dic 2025) → claude-haiku-4-5",
      ],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "La política documenta además notificaciones, auditoría del uso de modelos y mitigación de los inconvenientes de una deprecación. La consecuencia práctica es una sola: audita qué IDs usas en producción, porque un alias sin fecha en un modelo anterior a la 4.6 se mueve bajo tus pies y un ID fijado con fecha no.",
    },
    { type: "heading", level: 2, text: "El compromiso aplica por plataforma" },
    {
      type: "paragraph",
      text:
        "El compromiso de retiro aplica a las plataformas operadas por Anthropic: Claude API, Claude Platform on AWS y Microsoft Foundry. Amazon Bedrock y Google Cloud fijan sus propias fechas, lo que explica por qué modelos ya retirados en la Claude API siguen disponibles ahí. Si tu arquitectura depende de un modelo concreto más allá de su retiro en la Claude API, una plataforma de socio puede darte margen extra.",
    },
    {
      type: "quote",
      text:
        "No hay un calendario de LTS con ventanas fijas: cada modelo recibe su propia fecha de \"no antes de\", que se anuncia como compromiso mínimo.",
      author: "Documentación de ciclo de vida — Claude Developer Platform",
    },
    {
      type: "checklist",
      title: "Checklist de ciclo de vida para producción",
      items: [
        "Anoté la fecha de retiro \"no antes de\" de cada modelo que uso.",
        "Uso IDs fijados con fecha en producción, no alias que puedan moverse.",
        "Conozco la ruta de migración publicada hacia el sucesor de mi modelo.",
        "Verifiqué si mi plataforma (Anthropic vs. socio) fija sus propias fechas.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Qué significa exactamente la fecha de retiro \"no antes de\" de un modelo activo?",
      options: [
        "La fecha exacta en que el modelo dejará de funcionar",
        "Un compromiso mínimo: Anthropic no retirará el modelo antes de esa fecha, pero puede mantenerlo más",
        "La fecha en que el modelo pasa automáticamente a deprecado",
        "La fecha en que el precio del modelo baja a la mitad",
      ],
      correctIndex: 1,
      explanation:
        "La fórmula \"no antes de\" es un compromiso mínimo, no un calendario fijo. Anthropic se compromete a no retirar el modelo antes de esa fecha, pero puede mantenerlo disponible más tiempo. No es una fecha de deprecación ni de cambio de precio.",
    },
    {
      question:
        "Un modelo que usas en producción aparece marcado como \"deprecado\". ¿Qué es lo correcto según la política?",
      options: [
        "El modelo ya dejó de funcionar; las peticiones fallan de inmediato",
        "Sigue funcionando pero ya no se recomienda; hay ruta de migración y plazo de eliminación publicados",
        "No pasa nada: deprecado y activo son equivalentes",
        "Debes cambiar de plataforma cloud obligatoriamente",
      ],
      correctIndex: 1,
      explanation:
        "Un modelo deprecado sigue funcionando pero ya no se recomienda, y Anthropic publica una ruta de migración y un plazo de eliminación. Solo cuando pasa a \"retirado\" las peticiones fallan. Conviene migrar al reemplazo recomendado antes del plazo.",
    },
    {
      question:
        "¿Por qué un modelo ya retirado en la Claude API puede seguir disponible en Amazon Bedrock o Google Cloud?",
      options: [
        "Porque esas plataformas no tienen ciclo de vida",
        "Porque son plataformas operadas por socios que fijan sus propias fechas de retiro, distintas de las de Anthropic",
        "Porque Bedrock y Google Cloud copian siempre las fechas de Anthropic con un mes de retraso",
        "Porque los modelos retirados se reactivan automáticamente en cloud",
      ],
      correctIndex: 1,
      explanation:
        "El compromiso de retiro aplica a las plataformas operadas por Anthropic (Claude API, Claude Platform on AWS, Microsoft Foundry). Amazon Bedrock y Google Cloud son operadas por socios y fijan sus propias fechas, por lo que un modelo retirado en la Claude API puede seguir ahí.",
    },
  ],
};
