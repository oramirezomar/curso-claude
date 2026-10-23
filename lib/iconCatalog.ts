// Catálogo_Iconos del Curso_Claude (Claude Developer Platform).
//
// Mapa que asocia un identificador estable (IconId, en kebab-case con prefijo
// de categoría, p. ej. "concept-mensajes") con su archivo SVG local bajo
// /public/concept-icons/** y el nombre neutro del concepto o Nivel.
//
// Reglas conforme al design.md y a los Requisitos 11.1–11.6:
//  - Toda `path` empieza por "/" (asset local) y NUNCA es una URL externa
//    (http/https) — sin hotlinking ni marca (Req 11.4).
//  - Cada icono se referencia por un `id` estable resuelto por este catálogo
//    (Req 11.5).
//  - `resolveIcon` degrada de forma controlada al PLACEHOLDER_ICON si el id es
//    undefined o no existe; nunca lanza (Req 11.6).
//
// Los SVG neutros propios ya fueron generados en public/concept-icons/**.

import type { IconCatalog, IconEntry, IconId } from "./types";

// Icono neutro usado como degradación controlada (Req 11.6).
export const PLACEHOLDER_ICON: IconEntry = {
  id: "__placeholder__",
  path: "/concept-icons/_placeholder.svg",
  defaultLabel: "Concepto de la Claude Developer Platform",
};

export const iconCatalog: IconCatalog = {
  // ─── Niveles (3) ─────────────────────────────────────────────────────────
  "level-basico": {
    id: "level-basico",
    path: "/concept-icons/levels/basico.svg",
    defaultLabel: "Nivel BÁSICO",
  },
  "level-medio": {
    id: "level-medio",
    path: "/concept-icons/levels/medio.svg",
    defaultLabel: "Nivel MEDIO",
  },
  "level-avanzado": {
    id: "level-avanzado",
    path: "/concept-icons/levels/avanzado.svg",
    defaultLabel: "Nivel AVANZADO",
  },

  // ─── Conceptos / Áreas (neutros, sin marca) ──────────────────────────────
  "concept-modelos": {
    id: "concept-modelos",
    path: "/concept-icons/concepts/modelos.svg",
    defaultLabel: "Modelos y precios",
  },
  "concept-ciclo-vida": {
    id: "concept-ciclo-vida",
    path: "/concept-icons/concepts/ciclo-vida.svg",
    defaultLabel: "Ciclo de vida de modelos",
  },
  "concept-auth": {
    id: "concept-auth",
    path: "/concept-icons/concepts/auth.svg",
    defaultLabel: "Autenticación y versionado",
  },
  "concept-mensajes": {
    id: "concept-mensajes",
    path: "/concept-icons/concepts/mensajes.svg",
    defaultLabel: "Messages API",
  },
  "concept-thinking": {
    id: "concept-thinking",
    path: "/concept-icons/concepts/thinking.svg",
    defaultLabel: "Thinking y effort",
  },
  "concept-streaming": {
    id: "concept-streaming",
    path: "/concept-icons/concepts/streaming.svg",
    defaultLabel: "Streaming SSE",
  },
  "concept-cache": {
    id: "concept-cache",
    path: "/concept-icons/concepts/cache.svg",
    defaultLabel: "Caché de prompts",
  },
  "concept-batches": {
    id: "concept-batches",
    path: "/concept-icons/concepts/batches.svg",
    defaultLabel: "Batches y Files",
  },
  "concept-salidas": {
    id: "concept-salidas",
    path: "/concept-icons/concepts/salidas.svg",
    defaultLabel: "Salidas estructuradas",
  },
  "concept-herramientas": {
    id: "concept-herramientas",
    path: "/concept-icons/concepts/herramientas.svg",
    defaultLabel: "Tool use",
  },
  "concept-herramientas-cliente": {
    id: "concept-herramientas-cliente",
    path: "/concept-icons/concepts/herramientas-cliente.svg",
    defaultLabel: "Herramientas de cliente y toolsets",
  },
  "concept-herramientas-servidor": {
    id: "concept-herramientas-servidor",
    path: "/concept-icons/concepts/herramientas-servidor.svg",
    defaultLabel: "Herramientas de servidor",
  },
  "concept-contexto": {
    id: "concept-contexto",
    path: "/concept-icons/concepts/contexto.svg",
    defaultLabel: "Gestión de contexto",
  },
  "concept-errores": {
    id: "concept-errores",
    path: "/concept-icons/concepts/errores.svg",
    defaultLabel: "Errores y rate limits",
  },
  "concept-skills": {
    id: "concept-skills",
    path: "/concept-icons/concepts/skills.svg",
    defaultLabel: "Agent Skills",
  },
  "concept-mcp": {
    id: "concept-mcp",
    path: "/concept-icons/concepts/mcp.svg",
    defaultLabel: "MCP connector",
  },
  "concept-agentes": {
    id: "concept-agentes",
    path: "/concept-icons/concepts/agentes.svg",
    defaultLabel: "Managed Agents",
  },
  "concept-admin": {
    id: "concept-admin",
    path: "/concept-icons/concepts/admin.svg",
    defaultLabel: "Admin API",
  },
  "concept-identidad": {
    id: "concept-identidad",
    path: "/concept-icons/concepts/identidad.svg",
    defaultLabel: "Workload Identity Federation",
  },
  "concept-compliance": {
    id: "concept-compliance",
    path: "/concept-icons/concepts/compliance.svg",
    defaultLabel: "Compliance y gobernanza",
  },
  "concept-seguridad": {
    id: "concept-seguridad",
    path: "/concept-icons/concepts/seguridad.svg",
    defaultLabel: "Seguridad",
  },
  "concept-plataformas": {
    id: "concept-plataformas",
    path: "/concept-icons/concepts/plataformas.svg",
    defaultLabel: "Plataformas cloud",
  },
  "concept-arquitectura": {
    id: "concept-arquitectura",
    path: "/concept-icons/concepts/arquitectura.svg",
    defaultLabel: "Arquitectura y buenas prácticas",
  },
};

/**
 * Resuelve un IconId contra el Catálogo_Iconos.
 *
 * Degradación controlada (Req 11.6): devuelve PLACEHOLDER_ICON cuando el `id`
 * es `undefined` o no existe en el catálogo. Nunca lanza.
 */
export function resolveIcon(id: IconId | undefined): IconEntry {
  if (!id) return PLACEHOLDER_ICON;
  return iconCatalog[id] ?? PLACEHOLDER_ICON;
}
