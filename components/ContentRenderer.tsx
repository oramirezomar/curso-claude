import type { ContentBlock } from "@/lib/types";
import CodeBlock from "./CodeBlock";
import ConceptIcon from "./ConceptIcon";

function CalloutIcon({ variant }: { variant: "info" | "warning" | "success" }) {
  if (variant === "warning") return <span aria-hidden>⚠️</span>;
  if (variant === "success") return <span aria-hidden>✅</span>;
  return <span aria-hidden>💡</span>;
}

const calloutStyles: Record<string, string> = {
  info: "border-brand-400 bg-brand-50 text-brand-900 dark:bg-brand-900/20 dark:text-brand-100",
  warning: "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100",
  success: "border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-100",
};

export default async function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {await Promise.all(
        blocks.map(async (block, idx) => {
          switch (block.type) {
            case "heading":
              return block.level === 2 ? (
                <h2 key={idx} className="mt-6 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {block.text}
                </h2>
              ) : (
                <h3 key={idx} className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {block.text}
                </h3>
              );

            case "paragraph":
              return (
                <p key={idx} className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                  {block.text}
                </p>
              );

            case "quote":
              return (
                <blockquote
                  key={idx}
                  className="border-l-4 border-brand-400 bg-slate-50 py-3 pl-4 italic text-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                >
                  <p>&ldquo;{block.text}&rdquo;</p>
                  {block.author && (
                    <footer className="mt-1 text-sm font-medium not-italic text-slate-500 dark:text-slate-400">
                      — {block.author}
                    </footer>
                  )}
                </blockquote>
              );

            case "list":
              return block.ordered ? (
                <ol key={idx} className="list-decimal space-y-2 pl-6 text-slate-700 dark:text-slate-300">
                  {block.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              ) : (
                <ul key={idx} className="list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300">
                  {block.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              );

            case "code":
              return (
                <CodeBlock
                  key={idx}
                  code={block.code}
                  lang={block.lang}
                  title={block.title}
                  highlightLines={block.highlightLines}
                />
              );

            case "callout":
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 rounded-lg border-l-4 p-4 text-sm ${calloutStyles[block.variant]}`}
                >
                  <CalloutIcon variant={block.variant} />
                  <p className="leading-relaxed">{block.text}</p>
                </div>
              );

            case "checklist":
              return (
                <div key={idx} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  {block.title && (
                    <p className="mb-3 font-semibold text-slate-900 dark:text-slate-50">{block.title}</p>
                  )}
                  <ul className="space-y-2">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="mt-0.5 text-brand-500">☐</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );

            case "comparison":
              return (
                <div key={idx} className="grid gap-4 sm:grid-cols-2">
                  <CodeBlock code={block.before.code} lang={block.lang ?? "js"} title={block.before.title} />
                  <CodeBlock code={block.after.code} lang={block.lang ?? "js"} title={block.after.title} />
                </div>
              );

            case "serviceIcon":
              return (
                <div key={idx} className="flex flex-wrap gap-4">
                  {block.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50"
                    >
                      <ConceptIcon id={item.icon} label={item.service} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.service}
                      </span>
                    </div>
                  ))}
                </div>
              );

            default:
              return null;
          }
        }),
      )}
    </div>
  );
}
