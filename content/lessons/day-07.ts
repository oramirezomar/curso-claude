import type { Lesson } from "@/lib/types";

// Contenido redactado (tarea 14.2). Fuente de verdad técnica:
// docs-referencia/claude/claude-messages-detail.md (§3 Thinking y Effort) y
// claude-reference-claude-com.md (§6 niveles de effort). Terminología oficial.
// Req 3.5.
export const day07: Lesson = {
  day: 7,
  slug: "thinking-y-effort",
  title: "Thinking y effort",
  section: "MEDIO",
  estimatedMinutes: 26,
  icon: "concept-thinking",
  objectives: [
    "Distinguir el thinking adaptativo (vigente) del thinking extendido (deprecado) y saber por qué budget_tokens quedó atrás",
    "Controlar la profundidad de razonamiento con output_config.effort y sus cinco niveles",
    "Entender que effort es una señal de comportamiento, no un presupuesto estricto de tokens",
    "Recordar que los bloques thinking cuentan contra max_tokens y que la signature habilita la continuidad multi-turno",
  ],
  blocks: [
    {
      type: "paragraph",
      text:
        "El razonamiento interno de Claude cambió de paradigma. Antes se controlaba a mano con un presupuesto de tokens; ahora el modelo decide cuánto pensar, guiado por una señal de alto nivel llamada effort. Entender ese cambio es clave para no escribir código contra una API deprecada.",
    },
    { type: "heading", level: 2, text: "Adaptativo frente a extendido" },
    {
      type: "list",
      items: [
        "thinking.type \"adaptive\": modo vigente. El modelo decide cuánto pensar, guiado por effort. Es el único modo en Claude 4.7 y posteriores.",
        "thinking.type \"enabled\" + budget_tokens: el modo manual anterior. Deprecado en Opus 4.6 y Sonnet 4.6, y NO aceptado en modelos posteriores.",
        "thinking.type \"disabled\": desactiva el razonamiento.",
      ],
    },
    {
      type: "serviceIcon",
      items: [
        { service: "Thinking y effort", icon: "concept-thinking" },
        { service: "Modelos y precios", icon: "concept-modelos" },
        { service: "Caché de prompts", icon: "concept-cache" },
      ],
    },
    {
      type: "callout",
      variant: "warning",
      text:
        "Si tu código fija thinking.type \"enabled\" con budget_tokens, funcionará en modelos antiguos pero fallará en los posteriores a Sonnet 4.6, que no lo aceptan. La vía vigente es adaptive + effort.",
    },
    { type: "heading", level: 2, text: "Los cinco niveles de effort" },
    {
      type: "paragraph",
      text:
        "output_config.effort es el reemplazo conceptual de los parámetros de muestreo deprecados. No es un presupuesto estricto de tokens: es una señal de comportamiento. Con esfuerzo bajo el modelo sigue pensando en problemas difíciles; simplemente piensa menos que a esfuerzo alto para el mismo problema.",
    },
    {
      type: "code",
      lang: "text",
      title: "Niveles de effort, de menor a mayor",
      code:
        "low     El más eficiente. Ahorro de tokens, algo menos de capacidad.\n" +
        "medium  Equilibrio con ahorro moderado.\n" +
        "high    Capacidad alta. EQUIVALE A NO FIJAR EL PARÁMETRO.\n" +
        "xhigh   Capacidad extendida para trabajo de horizonte largo.\n" +
        "max     Capacidad máxima absoluta, sin restricción de gasto de tokens.",
      highlightLines: [3],
    },
    {
      type: "callout",
      variant: "info",
      text:
        "Dos matices que ahorran errores: high equivale a no fijar effort, y fijar effort explícitamente al valor por defecto del modelo equivale a omitirlo y NO invalida la caché. Además, no todos los modelos que soportan max soportan xhigh: son listas de compatibilidad distintas, no una escala anidada.",
    },
    {
      type: "code",
      lang: "python",
      title: "Pedir razonamiento profundo con effort alto",
      code:
        "msg = client.messages.create(\n" +
        "    model=\"claude-opus-5\",\n" +
        "    max_tokens=8192,\n" +
        "    output_config={\"effort\": \"xhigh\"},\n" +
        "    messages=[{\n" +
        "        \"role\": \"user\",\n" +
        "        \"content\": \"Analiza este contrato y enumera los riesgos legales.\",\n" +
        "    }],\n" +
        ")\n" +
        "for bloque in msg.content:\n" +
        "    if bloque.type == \"thinking\":\n" +
        "        print(\"[razonamiento]\", bloque.thinking[:80])\n" +
        "    elif bloque.type == \"text\":\n" +
        "        print(bloque.text)",
      highlightLines: [4],
    },
    { type: "heading", level: 2, text: "Thinking y tokens" },
    {
      type: "paragraph",
      text:
        "Cuando el razonamiento está activo, la respuesta incluye bloques thinking antes de la respuesta final, y esos tokens cuentan contra tu max_tokens. Es decir, el presupuesto de salida se reparte entre pensar y responder: si fijas un max_tokens demasiado ajustado con effort alto, el modelo puede quedarse sin margen para la respuesta visible.",
    },
    {
      type: "paragraph",
      text:
        "El bloque thinking trae una signature. Esa firma es la que permite la continuidad multi-turno: al reenviar el razonamiento en turnos posteriores, el modelo mantiene coherencia. Si configuras la visualización como omitida, el contenido se redacta pero se devuelve igualmente una signature para preservar esa continuidad.",
    },
    {
      type: "checklist",
      title: "Checklist de razonamiento",
      items: [
        "Uso thinking adaptive + effort, no enabled + budget_tokens.",
        "Elijo el nivel de effort por el perfil de la tarea, no por defecto siempre max.",
        "Dejo margen en max_tokens para que quepan thinking y respuesta.",
        "Preservo la signature del bloque thinking para la continuidad multi-turno.",
      ],
    },
  ],
  selfCheck: [
    {
      question: "¿Cuál es el modo de razonamiento vigente y cuál quedó deprecado?",
      options: [
        "Vigente: enabled con budget_tokens. Deprecado: adaptive",
        "Vigente: adaptive (el modelo decide, guiado por effort). Deprecado: enabled con budget_tokens",
        "Ambos están deprecados; ya no hay razonamiento",
        "Vigente: disabled. Deprecado: adaptive",
      ],
      correctIndex: 1,
      explanation:
        "El modo vigente es adaptive: el modelo decide cuánto pensar, guiado por effort, y es el único modo en Claude 4.7 y posteriores. El modo enabled con budget_tokens quedó deprecado en Opus 4.6 y Sonnet 4.6, y no se acepta en modelos posteriores.",
    },
    {
      question: "¿Qué describe mejor output_config.effort?",
      options: [
        "Un presupuesto estricto de tokens de razonamiento que el modelo nunca supera",
        "Una señal de comportamiento: a esfuerzo bajo el modelo piensa menos que a esfuerzo alto para el mismo problema, pero sigue pensando en lo difícil",
        "Un parámetro deprecado equivalente a temperature",
        "El número exacto de bloques thinking que se generarán",
      ],
      correctIndex: 1,
      explanation:
        "effort es una señal de comportamiento, no un presupuesto estricto de tokens. Con esfuerzo bajo el modelo sigue razonando sobre problemas suficientemente difíciles, solo piensa menos que a esfuerzo alto. Además, high equivale a no fijar el parámetro.",
    },
    {
      question: "Sobre los tokens de los bloques thinking cuando el razonamiento está activo:",
      options: [
        "Son gratis y no afectan a max_tokens",
        "Cuentan contra tu max_tokens, así que un max_tokens ajustado puede dejar sin margen a la respuesta",
        "Se facturan aparte a tarifa cero",
        "Solo cuentan en streaming",
      ],
      correctIndex: 1,
      explanation:
        "Los bloques thinking aparecen antes de la respuesta final y sus tokens cuentan contra max_tokens. Si fijas un max_tokens demasiado bajo con effort alto, el modelo puede agotar el presupuesto pensando y quedarse sin margen para la respuesta visible.",
    },
  ],
};
