import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  lang: "js" | "ts" | "text" | "bash" | "json" | "python";
  title?: string;
  highlightLines?: number[];
}

const langMap: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  text: "text",
  bash: "bash",
  json: "json",
  python: "python",
};

export default async function CodeBlock({ code, lang, title, highlightLines }: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang: langMap[lang] ?? "text",
    theme: "github-dark",
    transformers: highlightLines?.length
      ? [
          {
            line(node, line) {
              if (highlightLines.includes(line)) {
                this.addClassToHast(node, "highlighted-line");
              }
            },
          },
        ]
      : [],
  });

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-slate-700 bg-[#0d1117]">
      {title && (
        <div className="border-b border-slate-700 px-4 py-2 text-xs font-medium text-slate-400">
          {title}
        </div>
      )}
      <div
        className="overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:!bg-transparent [&_.highlighted-line]:bg-brand-500/20 [&_.highlighted-line]:border-l-2 [&_.highlighted-line]:border-brand-400 [&_.highlighted-line]:-ml-4 [&_.highlighted-line]:pl-[14px]"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
