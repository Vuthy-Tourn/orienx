"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; ordered: boolean; items: string[] };

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };

  const flushList = () => {
    if (list && list.items.length > 0) blocks.push({ type: "list", ...list });
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: heading[1] });
      continue;
    }

    const bullet = line.match(/^(?:[-*•\u2022])\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }

    const ordered = line.match(/^\d+[.)]\s+(.*)$/);
    if (ordered) {
      flushParagraph();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(ordered[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function renderInline(
  text: string,
  keyPrefix: string,
  isUser: boolean
): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s]+)/g);
  return parts.filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong
          key={key}
          className={
            isUser
              ? "font-bold text-white"
              : "font-bold text-[#111965] dark:text-white"
          }
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={key}
          className={cn(
            "rounded-md px-1.5 py-0.5 font-mono text-[13px]",
            isUser
              ? "bg-white/15 text-white"
              : "bg-[#F0F2FA] text-[#111965] dark:bg-white/10 dark:text-slate-200"
          )}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (/^https?:\/\//.test(part)) {
      const url = part.replace(/[.,;:!?)]+$/, "");
      const suffix = part.slice(url.length);
      return (
        <React.Fragment key={key}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={
              isUser
                ? "break-all font-semibold text-[#F7CE4D] underline decoration-[#F7CE4D] decoration-2 underline-offset-2 hover:text-white"
                : "break-all font-semibold text-[#111965] underline decoration-[#F7CE4D] decoration-2 underline-offset-2 hover:text-[#1A2580] dark:text-[#F7CE4D]"
            }
          >
            {url}
          </a>
          {suffix}
        </React.Fragment>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

export function AssistantMessage({
  content,
  tone = "assistant",
}: {
  content: string;
  tone?: "user" | "assistant";
}) {
  const blocks = React.useMemo(() => parseBlocks(content), [content]);
  const isUser = tone === "user";

  return (
    <div
      className={cn(
        "space-y-3 text-[15px] leading-7 text-pretty break-words",
        isUser
          ? "text-white"
          : "text-[#334155] dark:text-slate-200"
      )}
    >
      {blocks.map((block, blockIndex) => {
        const key = `block-${blockIndex}`;
        if (block.type === "heading") {
          return (
            <p
              key={key}
              className={
                isUser
                  ? "text-[15px] font-black leading-6 text-white"
                  : "text-[15px] font-black leading-6 text-[#111965] dark:text-white"
              }
            >
              {renderInline(block.text, key, isUser)}
            </p>
          );
        }
        if (block.type === "list") {
          if (block.ordered) {
            return (
              <ol key={key} className="space-y-2.5">
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black",
                        isUser
                          ? "bg-white/15 text-white"
                          : "bg-[#F0F2FA] text-[#111965] dark:bg-white/10 dark:text-[#F7CE4D]"
                      )}
                    >
                      {itemIndex + 1}
                    </span>
                    <span className="min-w-0">
                      {renderInline(item, `${key}-${itemIndex}`, isUser)}
                    </span>
                  </li>
                ))}
              </ol>
            );
          }
          return (
            <ul key={key} className="space-y-2.5">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`} className="flex items-start gap-2.5">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#F7CE4D]" />
                  <span className="min-w-0">
                    {renderInline(item, `${key}-${itemIndex}`, isUser)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={key} className="leading-7">
            {renderInline(block.text, key, isUser)}
          </p>
        );
      })}
    </div>
  );
}
