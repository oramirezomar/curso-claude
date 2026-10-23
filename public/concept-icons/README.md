# concept-icons

Iconografía **neutra y original** del proyecto `curso-claude`. Son formas geométricas abstractas (cuadrado redondeado de fondo por categoría + una abreviatura corta o un glifo geométrico que evoca el concepto).

> **No son marcas.** No contienen ni evocan el logotipo de Anthropic/Claude ni de ningún tercero, no sugieren patrocinio ni afiliación (Req 11.3, 11.8). Todas las rutas son locales y empiezan por `/` (Req 11.4).

Todos los SVG usan `viewBox="0 0 64 64"` con relación de aspecto 1:1 e incluyen un `<title>` para accesibilidad.

## Niveles (`levels/`)

| IconId | Archivo | Concepto |
|---|---|---|
| `level-basico` | `levels/basico.svg` | Nivel BÁSICO |
| `level-medio` | `levels/medio.svg` | Nivel MEDIO |
| `level-avanzado` | `levels/avanzado.svg` | Nivel AVANZADO |

## Conceptos / Áreas (`concepts/`)

| IconId | Archivo | Concepto |
|---|---|---|
| `concept-modelos` | `concepts/modelos.svg` | Modelos y precios |
| `concept-ciclo-vida` | `concepts/ciclo-vida.svg` | Ciclo de vida de modelos |
| `concept-auth` | `concepts/auth.svg` | Autenticación y versionado |
| `concept-mensajes` | `concepts/mensajes.svg` | Messages API |
| `concept-thinking` | `concepts/thinking.svg` | Thinking y effort |
| `concept-streaming` | `concepts/streaming.svg` | Streaming SSE |
| `concept-cache` | `concepts/cache.svg` | Caché de prompts |
| `concept-batches` | `concepts/batches.svg` | Batches y Files |
| `concept-salidas` | `concepts/salidas.svg` | Salidas estructuradas |
| `concept-herramientas` | `concepts/herramientas.svg` | Tool use |
| `concept-herramientas-cliente` | `concepts/herramientas-cliente.svg` | Herramientas de cliente y toolsets |
| `concept-herramientas-servidor` | `concepts/herramientas-servidor.svg` | Herramientas de servidor |
| `concept-contexto` | `concepts/contexto.svg` | Gestión de contexto |
| `concept-errores` | `concepts/errores.svg` | Errores y rate limits |
| `concept-skills` | `concepts/skills.svg` | Agent Skills |
| `concept-mcp` | `concepts/mcp.svg` | MCP connector |
| `concept-agentes` | `concepts/agentes.svg` | Managed Agents |
| `concept-admin` | `concepts/admin.svg` | Admin API |
| `concept-identidad` | `concepts/identidad.svg` | Workload Identity Federation |
| `concept-compliance` | `concepts/compliance.svg` | Compliance y gobernanza |
| `concept-seguridad` | `concepts/seguridad.svg` | Seguridad |
| `concept-plataformas` | `concepts/plataformas.svg` | Plataformas cloud |
| `concept-arquitectura` | `concepts/arquitectura.svg` | Arquitectura y buenas prácticas |

## Placeholder

| IconId | Archivo | Concepto |
|---|---|---|
| `__placeholder__` | `_placeholder.svg` | Degradación controlada (concepto genérico) |

## Reemplazo

Estos SVG son **placeholders neutros originales** y pueden reemplazarse por un set propio de diseño más elaborado cuando se desee, **sin cambiar los nombres de archivo ni las rutas** (el `iconCatalog` referencia estas rutas estables). Mantén `viewBox="0 0 64 64"`, relación 1:1, el `<title>` accesible y la ausencia de marcas.
