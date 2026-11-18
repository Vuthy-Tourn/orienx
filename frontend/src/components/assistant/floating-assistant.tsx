"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Loader2,
  LogIn,
  Scale,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

type AssistantMode = "gemini" | "retrieval_only" | "local_model";

interface AssistantSource {
  type: string;
  title_en: string;
  title_km: string;
  url: string;
  snippet_en: string;
  snippet_km: string;
}

interface AssistantAnswer {
  interaction_id: string;
  answer: string;
  mode: AssistantMode;
  model_name?: string | null;
  sources: AssistantSource[];
  suggested_questions: string[];
  tools_used?: string[];
  warning?: string | null;
}

interface AssistantStatus {
  configured: boolean;
  model: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: AssistantSource[];
  toolsUsed?: string[];
  warning?: string | null;
}

const HIDDEN_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/dashboard/advisor",
  "/admin",
  "/share",
];

const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  search_universities: Search,
  compare_universities: Scale,
  check_eligibility: BadgeCheck,
};

function cleanText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ");
}

export function FloatingAssistant() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isKm = language === "km";

  const copy = isKm
    ? {
        title: "ជំនួយការ Futera",
        subtitle: "សួរបានយ៉ាងរហ័ស",
        open: "បើកជំនួយការ",
        close: "បិទ",
        welcome: "សួស្តី! ខ្ញុំអាចជួយរកសាកលវិទ្យាល័យ ជំនាញ អាហារូបករណ៍ និងលក្ខខណ្ឌចូលរៀន។",
        placeholder: "សួរអំពីការសិក្សា...",
        send: "ផ្ញើ",
        thinking: "កំពុងគិត...",
        sources: "ប្រភព",
        signIn: "ចូលគណនីដើម្បីសាកសួរជំនួយការ។",
        signInCta: "ចូលគណនី",
        offline: "Gemini មិនទាន់បានកំណត់ទេ — ចម្លើយមកពីទិន្នន័យផ្ទៀងផ្ទាត់។",
        error: "មិនអាចទទួលចម្លើយបានទេ។ សូមព្យាយាមម្តងទៀត។",
        suggestions: [
          "ថ្លៃសិក្សានៅ ITC ប៉ុន្មាន?",
          "តើសាកលវិទ្យាល័យណាខ្លះបង្រៀន software engineering?",
          "មានអាហារូបករណ៍អ្វីខ្លះ?",
          "តើខ្ញុំអាចចូលរៀនដោយនិទ្ទេស C បានទេ?",
        ],
      }
    : {
        title: "Futera Assistant",
        subtitle: "Quick answers",
        open: "Open assistant",
        close: "Close",
        welcome:
          "Hi! I can help with universities, majors, scholarships, and admission requirements.",
        placeholder: "Ask about studying...",
        send: "Send",
        thinking: "Thinking...",
        sources: "Sources",
        signIn: "Sign in to chat with the Futera Assistant.",
        signInCta: "Sign in",
        offline: "Gemini is not configured — answers come from verified records.",
        error: "Could not get an answer. Please try again.",
        suggestions: [
          "How much is ITC tuition?",
          "Which universities offer software engineering?",
          "What scholarships can I apply for?",
          "Can I get in with a grade C?",
        ],
      };

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const messageCounter = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { data: status } = useQuery({
    queryKey: ["assistant-status"],
    queryFn: () => apiFetch<AssistantStatus>("/ai/assistant/status"),
    enabled: open && Boolean(user),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, isSending]);

  if (!pathname || HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const send = async (rawQuestion?: string) => {
    const question = (rawQuestion ?? input).trim();
    if (!question || isSending || !user) return;

    setInput("");
    setError(null);
    setMessages((previous) => [
      ...previous,
      {
        id: `user-${messageCounter.current++}`,
        role: "user",
        content: question,
      },
    ]);
    setIsSending(true);

    try {
      const data = await apiFetch<AssistantAnswer>("/ai/assistant", {
        method: "POST",
        body: JSON.stringify({ question, language }),
      });
      setMessages((previous) => [
        ...previous,
        {
          id: data.interaction_id,
          role: "assistant",
          content: data.answer,
          sources: data.sources,
          toolsUsed: data.tools_used,
          warning: data.warning,
        },
      ]);
      if (data.suggested_questions?.length) {
        setSuggestions(data.suggested_questions);
      }
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : copy.error
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  };

  const visibleSuggestions = suggestions?.length
    ? suggestions
    : copy.suggestions;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? copy.close : copy.open}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 right-5 z-[60] flex h-16 w-16 items-center justify-center rounded-full",
          "border-[3px] border-[#F7CE4D] bg-[#111965] shadow-2xl shadow-[#111965]/30",
          "transition-transform hover:scale-105 active:scale-95",
          open && "ring-4 ring-[#F7CE4D]/25"
        )}
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Image
            src="/images/welcome-hd.webp"
            alt=""
            width={62}
            height={66}
            className="h-[60px] w-[57px] object-contain drop-shadow"
            priority={false}
          />
        )}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
        )}
      </button>

      {open && (
        <section
          className="fixed bottom-24 right-3 z-[60] flex h-[min(72vh,540px)] w-[min(calc(100vw-1.5rem),380px)] flex-col overflow-hidden rounded-[26px] border border-[#E6E8F0] bg-white shadow-2xl shadow-black/20 sm:right-5 dark:border-white/10 dark:bg-[#0B102A]"
          aria-label={copy.title}
        >
          <header className="flex items-center gap-3 bg-[#111965] px-4 py-3 text-white">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F7CE4D]">
              <Image
                src="/images/welcome-hd.webp"
                alt=""
                width={30}
                height={32}
                className="h-[30px] w-[28px] object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black">{copy.title}</div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-white/60">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    status?.configured ? "bg-emerald-400" : "bg-[#F7CE4D]"
                  )}
                />
                {status?.configured
                  ? `Gemini · ${status.model}`
                  : copy.subtitle}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={copy.close}
              className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          {user && status && !status.configured && (
            <div className="border-b border-[#F7CE4D]/40 bg-[#FFF9E6] px-3 py-2 text-[10px] leading-snug text-[#7A5A00] dark:border-[#F7CE4D]/20 dark:bg-[#F7CE4D]/10 dark:text-[#F7CE4D]">
              {copy.offline}
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#F8F9FC] px-3 py-3 dark:bg-[#080D22]"
            aria-live="polite"
          >
            {!user ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <LogIn className="mb-3 h-8 w-8 text-[#111965] dark:text-[#F7CE4D]" />
                <p className="text-xs leading-relaxed text-[#68708A] dark:text-slate-400">
                  {copy.signIn}
                </p>
                <Link
                  href="/login"
                  className="mt-4 rounded-xl bg-[#111965] px-4 py-2 text-xs font-black text-white dark:bg-[#F7CE4D] dark:text-[#111965]"
                >
                  {copy.signInCta}
                </Link>
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-2xl border border-[#E6E8F0] bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                  <Sparkles className="h-3 w-3 text-[#F7CE4D]" />
                  Futera AI
                </div>
                <p className="text-xs leading-relaxed text-[#68708A] dark:text-slate-400">
                  {copy.welcome}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                      message.role === "user"
                        ? "rounded-br-md bg-[#111965] text-white"
                        : "rounded-bl-md border border-[#E6E8F0] bg-white text-[#171A2C] dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                    )}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {cleanText(message.content)}
                    </div>

                    {message.warning && (
                      <div className="mt-2 rounded-lg bg-[#FFF9E6] px-2 py-1.5 text-[10px] leading-snug text-[#7A5A00] dark:bg-[#F7CE4D]/10 dark:text-[#F7CE4D]">
                        {message.warning}
                      </div>
                    )}

                    {message.toolsUsed && message.toolsUsed.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.toolsUsed.map((tool) => {
                          const Icon = TOOL_ICONS[tool];
                          if (!Icon) return null;
                          return (
                            <span
                              key={tool}
                              className="inline-flex items-center gap-1 rounded-full bg-[#F0F2FA] px-1.5 py-0.5 text-[9px] font-bold text-[#111965] dark:bg-white/10 dark:text-slate-300"
                            >
                              <Icon className="h-2.5 w-2.5" />
                              {tool.replaceAll("_", " ")}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 border-t border-[#E6E8F0] pt-2 dark:border-white/10">
                        <div className="mb-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                          {copy.sources}
                        </div>
                        <div className="space-y-1">
                          {message.sources.slice(0, 3).map((source) => (
                            <Link
                              key={`${message.id}-${source.url}`}
                              href={source.url}
                              className="block truncate text-[10px] font-semibold text-[#111965] hover:underline dark:text-[#F7CE4D]"
                            >
                              {isKm
                                ? source.title_km || source.title_en
                                : source.title_en}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isSending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-[#E6E8F0] bg-white px-3 py-2 text-[10px] font-semibold text-[#68708A] dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {copy.thinking}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          )}

          {user && (
            <div className="border-t border-[#E6E8F0] bg-white p-2.5 dark:border-white/10 dark:bg-[#0B102A]">
              {messages.length > 0 && visibleSuggestions.length > 0 && (
                <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                  {visibleSuggestions.slice(0, 4).map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void send(question)}
                      disabled={isSending}
                      className="shrink-0 rounded-full border border-[#E6E8F0] bg-[#F8F9FC] px-2.5 py-1 text-[9px] font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA] disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={copy.placeholder}
                  maxLength={500}
                  className="h-10 min-w-0 flex-1 rounded-xl border border-[#E6E8F0] bg-[#F8F9FC] px-3 text-xs text-[#171A2C] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#111965]/40 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#F7CE4D]/40"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={isSending || !input.trim()}
                  aria-label={copy.send}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#111965] text-white transition-colors hover:bg-[#1A247F] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#F7CE4D] dark:text-[#111965]"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}
