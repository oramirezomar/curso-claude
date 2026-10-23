// Componente ConceptIcon del Curso_Claude (Claude Developer Platform).
//
// Resuelve un identificador estable (IconId) contra el Catálogo_Iconos y
// renderiza el SVG local correspondiente como un asset bajo /public.
//
// Es un componente de servidor simple (no usa hooks ni estado), por lo que no
// requiere la directiva "use client".
//
// Reglas conforme al design.md y a los Requisitos 1.6, 11.6, 11.7, 11.8:
//  - Preserva la relación de aspecto original: tamaño cuadrado uniforme por
//    `size` (width === height) y `objectFit: "contain"`. NO aplica transform
//    (rotate/scale no uniforme), ni clip-path, ni recorte (Req 11.6).
//  - Texto alternativo accesible SIEMPRE no vacío: usa `label` y, si viniera
//    vacío, cae al `defaultLabel` de la entrada resuelta (Req 11.7).
//  - Degradación controlada: `resolveIcon` ya devuelve el PLACEHOLDER_ICON para
//    ids inexistentes, por lo que el componente nunca lanza (Req 11.8).
//  - Nombre e iconografía neutros, sin referencia a marca (Req 1.6).

import { resolveIcon } from "@/lib/iconCatalog";

interface ConceptIconProps {
  id: string; // identificador estable del Catálogo_Iconos
  label: string; // nombre del concepto o Nivel (accesibilidad)
  size?: number; // px; por defecto 32 — escala uniforme
  className?: string;
}

export default function ConceptIcon({ id, label, size = 32, className }: ConceptIconProps) {
  const entry = resolveIcon(id);
  // El alt/aria-label nunca debe quedar vacío (Req 11.7).
  const alt = label.trim() ? label : entry.defaultLabel;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={entry.path}
      alt={alt}
      aria-label={alt}
      width={size}
      height={size}
      className={className}
      // Tamaño cuadrado uniforme + contain: preserva aspect-ratio sin recortar,
      // voltear, rotar ni distorsionar (Req 11.6).
      style={{ objectFit: "contain" }}
    />
  );
}
