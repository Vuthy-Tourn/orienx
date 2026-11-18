"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Award,
  BadgeCheck,
  BookOpen,
  Bot,
  Briefcase,
  Cpu,
  GraduationCap,
  Loader2,
  Scale,
  Search,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

type AdvisorMode = "local_model" | "retrieval_only";

interface AdvisorSource {
  type: string;
  id: string;
  title_en: string;
  title_km: string;
  url: string;
  snippet_en: string;
  snippet_km: string;
}

interface AdvisorStatus {
  enabled: boolean;
  model_connected: boolean;
  model_name?: string | null;
  mode: AdvisorMode;
  setup_command: string;
}

interface StreamMeta {
  sources: AdvisorSource[];
  tools_used?: string[];
  mode: AdvisorMode;
  model_name?: string | null;
}

interface StreamDone {
  interaction_id: string;
  answer: string;
  mode: AdvisorMode;
  model_name?: string | null;
  tools_used?: string[];
  suggested_questions?: string[];
  latency_ms?: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: AdvisorMode;
  sources?: AdvisorSource[];
  interactionId?: string;
  feedback?: "up" | "down";
  toolsUsed?: string[];
}

const EN_SUGGESTIONS = [
  "Which universities offer software engineering?",
  "How much does ITC cost per year?",
  "What scholarships can I apply for?",
  "Which major suits a creative student?",
];

const KM_SUGGESTIONS = [
  "តើសាកលវិទ្យាល័យណាខ្លះបង្រៀនវិស្វកម្មកុំព្យូទ័រ?",
  "ថ្លៃសិក្សានៅ ITC ប៉ុន្មានក្នុងមួយឆ្នាំ?",
  "មានអាហារូបករណ៍អ្វីខ្លះសម្រាប់និស្សិត?",
  "តើជំនាញណាសមស្របនឹងមនុស្សចូលចិត្តបង្កើតរបស់ថ្មី?",
];

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  university: GraduationCap,
  major: BookOpen,
  career: Briefcase,
  scholarship: Award,
};

const TOOL_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; en: string; km: string }
> = {
  search_universities: {
    icon: Search,
    en: "University search",
    km: "ស្វែងរកសាកលវិទ្យាល័យ",
  },
  compare_universities: {
    icon: Scale,
    en: "Tuition comparison",
    km: "ប្រៀបធៀបថ្លៃសិក្សា",
  },
  check_eligibility: {
    icon: BadgeCheck,
    en: "Eligibility check",
    km: "ពិនិត្យលក្ខខណ្ឌ",
  },
};

function formatAnswer(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ");
}

async function fetchWithRefresh(
  input: RequestInfo | URL,
  init: RequestInit
): Promise<Response> {
  let response = await fetch(input, init);
  if (response.status !== 401) return response;

  const refresh = await fetch("/api/v1/auth/refresh?cookie_only=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
  });
  if (!refresh.ok) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("futera:session-expired"));
    }
    return response;
  }
  response = await fetch(input, init);
  return response;
}

export function AdvisorChat() {
  const { language } = useLanguage();
  const isKm = language === "km";

  const copy = isKm
    ? {
        kicker: "ជំនួយការតម្រង់ទិស",
        title: "សួរ OrienX AI",
        subtitle:
          "ស្វែងរកសាកលវិទ្យាល័យ ជំនាញ អាហារូបករណ៍ និងអាជីព ដោយផ្អែកលើទិន្នន័យដែលបានផ្ទៀងផ្ទាត់របស់ OrienX។",
        emptyTitle: "តើអ្នកចង់ដឹងអ្វី?",
        emptyBody:
          "សួរជាភាសាខ្មែរ ឬអង់គ្លេស។ ចម្លើយផ្អែកលើទិន្នន័យសាកលវិទ្យាល័យ និងអាហារូបករណ៍របស់ OrienX។",
        placeholder: "សួរអំពីសាកលវិទ្យាល័យ ជំនាញ ឬអាហារូបករណ៍...",
        send: "ផ្ញើ",
        thinking: "កំពុងស្វែងរកទិន្នន័យ...",
        sources: "ប្រភព",
        feedback: "តើចម្លើយនេះមានប្រយោជន៍ទេ?",
        error: "មិនអាចទទួលចម្លើយបានទេ។ សូមព្យាយាមម្តងទៀត។",
        localMode: "ម៉ូដែល AI មូលដ្ឋាន",
        retrievalMode: "ទិន្នន័យផ្ទៀងផ្ទាត់",
        checking: "កំពុងពិនិត្យម៉ូដែល...",
        offlineTitle: "ម៉ូដែល AI មូលដ្ឋានមិនទាន់ដំណើរការ",
        offlineBody:
          "ចម្លើយត្រូវបានបង្កើតដោយផ្ទាល់ពីទិន្នន័យដែលបានផ្ទៀងផ្ទាត់។ ដើម្បីទទួលបានចម្លើយសន្ទនា សូមដំណើរការ Ollama ក្នុងកុំព្យូទ័ររបស់អ្នក (ឥតគិតថ្លៃ)។",
        you: "អ្នក",
        advisor: "OrienX AI",
        helpful: "មានប្រយោជន៍",
        notHelpful: "មិនមានប្រយោជន៍",
      }
    : {
        kicker: "Guidance assistant",
        title: "Ask OrienX AI",
        subtitle:
          "Explore universities, majors, scholarships, and careers grounded in OrienX's verified records.",
        emptyTitle: "What would you like to know?",
        emptyBody:
          "Ask in English or Khmer. Answers are grounded in OrienX's university, major, and scholarship data.",
        placeholder: "Ask about a university, major, or scholarship...",
        send: "Send",
        thinking: "Searching verified records...",
        sources: "Sources",
        feedback: "Was this answer helpful?",
        error: "Could not get an answer. Please try again.",
        localMode: "Local AI model",
        retrievalMode: "Verified records",
        checking: "Checking local model...",
        offlineTitle: "Local AI model is not running",
        offlineBody:
          "Answers are being assembled directly from verified records. To enable conversational replies, start Ollama on your computer (free).",
        you: "You",
        advisor: "OrienX AI",
        helpful: "Helpful",
        notHelpful: "Not helpful",
      };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answerSuggestions, setAnswerSuggestions] = useState<string[] | null>(
    null
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageCounter = useRef(0);
  const suggestions =
    answerSuggestions && answerSuggestions.length > 0
      ? answerSuggestions
      : isKm
        ? KM_SUGGESTIONS
        : EN_SUGGESTIONS;

  const { data: status } = useQuery({
    queryKey: ["ai-advisor-status"],
    queryFn: () => apiFetch<AdvisorStatus>("/ai/status"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, isSending]);

  const send = async (rawQuestion?: string) => {
    const question = (rawQuestion ?? input).trim();
    if (!question || isSending) return;

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
    setStreamingId(null);
    const assistantId = `assistant-${messageCounter.current++}`;
    let assistantAdded = false;
    let receivedText = false;

    const ensureAssistant = (meta?: StreamMeta) => {
      if (!assistantAdded) {
        assistantAdded = true;
        setStreamingId(assistantId);
        setMessages((previous) => [
          ...previous,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            mode: meta?.mode,
            sources: meta?.sources,
            toolsUsed: meta?.tools_used,
          },
        ]);
        return;
      }
      if (meta) {
        setMessages((previous) =>
          previous.map((item) =>
            item.id === assistantId
              ? {
                  ...item,
                  mode: meta.mode,
                  sources: meta.sources,
                  toolsUsed: meta.tools_used,
                }
              : item
          )
        );
      }
    };

    try {
      const response = await fetchWithRefresh("/api/v1/ai/advisor/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ question, language }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          detail?: unknown;
        } | null;
        const detail = payload?.detail;
        const message = Array.isArray(detail)
          ? detail
              .map((item: { msg?: string }) => item?.msg || "Invalid value")
              .join(" ")
          : typeof detail === "string"
            ? detail
            : `${response.status} ${response.statusText}`;
        throw new Error(message);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error(copy.error);

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          let eventName = "message";
          let dataLine = "";
          for (const line of part.split("\n")) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLine += line.slice(5).trimStart();
            }
          }
          if (!dataLine) continue;

          let data: unknown;
          try {
            data = JSON.parse(dataLine);
          } catch {
            continue;
          }

          if (eventName === "meta") {
            ensureAssistant(data as StreamMeta);
          } else if (eventName === "token") {
            const text = (data as { text?: string }).text || "";
            if (!text) continue;
            receivedText = true;
            ensureAssistant();
            setMessages((previous) =>
              previous.map((item) =>
                item.id === assistantId
                  ? { ...item, content: item.content + text }
                  : item
              )
            );
          } else if (eventName === "done") {
            const done = data as StreamDone;
            if (done.answer) receivedText = true;
            ensureAssistant();
            setMessages((previous) =>
              previous.map((item) =>
                item.id === assistantId
                  ? {
                      ...item,
                      content: done.answer || item.content,
                      interactionId: done.interaction_id,
                      mode: done.mode,
                      toolsUsed: done.tools_used,
                    }
                  : item
              )
            );
            if (done.suggested_questions?.length) {
              setAnswerSuggestions(done.suggested_questions);
            }
          }
        }
      }

      if (!assistantAdded || !receivedText) {
        throw new Error(copy.error);
      }
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : copy.error
      );
    } finally {
      setIsSending(false);
      setStreamingId(null);
    }
  };

  const rate = async (message: ChatMessage, helpful: boolean) => {
    if (!message.interactionId || message.feedback) return;
    setMessages((previous) =>
      previous.map((item) =>
        item.id === message.id
          ? { ...item, feedback: helpful ? "up" : "down" }
          : item
      )
    );
    try {
      await apiFetch(`/ai/interactions/${message.interactionId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ is_helpful: helpful }),
      });
    } catch {
      // Feedback is optional; keep the optimistic UI.
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void send();
    }
  };

  const connected = Boolean(status?.model_connected);
  const statusLabel = !status
    ? copy.checking
    : connected
      ? `${copy.localMode}${status.model_name ? ` · ${status.model_name}` : ""}`
      : copy.retrievalMode;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <section className="relative overflow-hidden rounded-[28px] bg-[#111965] px-5 py-6 text-white shadow-xl shadow-[#111965]/10 sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#F7CE4D]/20 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-16 h-24 w-24 rounded-full border border-white/10"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#F7CE4D]">
              <Sparkles className="h-3.5 w-3.5" />
              {copy.kicker}
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
              {copy.subtitle}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7CE4D] text-[#111965]">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                {isKm ? "ស្ថានភាព" : "Status"}
              </div>
              <div className="flex items-center gap-2 text-xs font-black">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    !status
                      ? "bg-white/40"
                      : connected
                        ? "bg-emerald-400"
                        : "bg-[#F7CE4D]"
                  )}
                />
                <span className="max-w-[220px] truncate">{statusLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {status && !connected && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#F7CE4D]/60 bg-[#FFF9E6] px-4 py-3 text-[#7A5A00] dark:border-[#F7CE4D]/30 dark:bg-[#F7CE4D]/10 dark:text-[#F7CE4D]">
          <Cpu className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 text-xs leading-relaxed">
            <p className="font-black">{copy.offlineTitle}</p>
            <p className="mt-0.5 text-[11px] opacity-80">{copy.offlineBody}</p>
            {status.setup_command && (
              <code className="mt-1.5 inline-block rounded-md bg-black/5 px-2 py-1 font-mono text-[10px] dark:bg-black/30">
                {status.setup_command}
              </code>
            )}
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-[28px] border border-[#E6E8F0] bg-white shadow-sm dark:border-white/10 dark:bg-[#0B102A]">
        <div
          ref={scrollRef}
          className="max-h-[58vh] min-h-[360px] overflow-y-auto px-4 py-5 sm:px-6"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-8 text-center">
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F0F2FA] text-[#111965] dark:bg-white/5 dark:text-[#F7CE4D]">
                <Bot className="h-8 w-8" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#F7CE4D] text-[#111965]">
                  <Sparkles className="h-3 w-3" />
                </span>
              </div>
              <h2 className="text-lg font-black text-[#111965] dark:text-white">
                {copy.emptyTitle}
              </h2>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-[#68708A] dark:text-slate-400">
                {copy.emptyBody}
              </p>

              <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
                {(isKm ? KM_SUGGESTIONS : EN_SUGGESTIONS).map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void send(question)}
                    className="rounded-2xl border border-[#E6E8F0] bg-[#F8F9FC] px-4 py-3 text-left text-xs font-semibold text-[#111965] transition-colors hover:border-[#111965]/30 hover:bg-[#F0F2FA] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#111965] text-[#F7CE4D]">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[86%] sm:max-w-[78%]",
                      message.role === "user" && "order-first"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        message.role === "user"
                          ? "rounded-br-md bg-[#111965] text-white"
                          : "rounded-bl-md border border-[#E6E8F0] bg-[#F8F9FC] text-[#171A2C] dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                      )}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {message.content ? (
                          formatAnswer(message.content)
                        ) : (
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#68708A] dark:text-slate-400">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {copy.thinking}
                          </span>
                        )}
                      </div>
                    </div>

                    {message.role === "assistant" && (
                      <div className="mt-2 space-y-2">
                        {message.mode && (
                          <div
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide",
                              message.mode === "local_model"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                : "bg-[#F7CE4D]/20 text-[#7A5A00] dark:text-[#F7CE4D]"
                            )}
                          >
                            {message.mode === "local_model" ? (
                              <Cpu className="h-3 w-3" />
                            ) : (
                              <BookOpen className="h-3 w-3" />
                            )}
                            {message.mode === "local_model"
                              ? copy.localMode
                              : copy.retrievalMode}
                          </div>
                        )}

                        {message.toolsUsed && message.toolsUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {message.toolsUsed.map((tool) => {
                              const meta = TOOL_META[tool];
                              if (!meta) return null;
                              const Icon = meta.icon;
                              return (
                                <span
                                  key={tool}
                                  className="inline-flex items-center gap-1 rounded-full border border-[#111965]/15 bg-[#F0F2FA] px-2 py-1 text-[10px] font-bold text-[#111965] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                                >
                                  <Icon className="h-3 w-3" />
                                  {isKm ? meta.km : meta.en}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {message.sources && message.sources.length > 0 && (
                          <div>
                            <div className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8] dark:text-slate-500">
                              {copy.sources}
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {message.sources.slice(0, 4).map((source) => {
                                const Icon =
                                  SOURCE_ICONS[source.type] ?? BookOpen;
                                return (
                                  <Link
                                    key={`${message.id}-${source.id}`}
                                    href={source.url}
                                    className="group flex items-start gap-2.5 rounded-xl border border-[#E6E8F0] bg-white p-2.5 transition-colors hover:border-[#111965]/30 hover:bg-[#F8F9FC] dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                                  >
                                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0F2FA] text-[#111965] dark:bg-white/10 dark:text-[#F7CE4D]">
                                      <Icon className="h-3.5 w-3.5" />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block truncate text-[11px] font-bold text-[#111965] group-hover:underline dark:text-slate-200">
                                        {isKm
                                          ? source.title_km || source.title_en
                                          : source.title_en}
                                      </span>
                                      <span className="mt-0.5 line-clamp-2 block text-[10px] leading-snug text-[#68708A] dark:text-slate-400">
                                        {isKm
                                          ? source.snippet_km || source.snippet_en
                                          : source.snippet_en}
                                      </span>
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {message.interactionId && (
                          <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] dark:text-slate-500">
                            <span>{copy.feedback}</span>
                            <button
                              type="button"
                              onClick={() => void rate(message, true)}
                              aria-label={copy.helpful}
                              title={copy.helpful}
                              className={cn(
                                "rounded-md p-1 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10",
                                message.feedback === "up" &&
                                  "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                              )}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void rate(message, false)}
                              aria-label={copy.notHelpful}
                              title={copy.notHelpful}
                              className={cn(
                                "rounded-md p-1 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10",
                                message.feedback === "down" &&
                                  "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                              )}
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSending && !streamingId && (
                <div className="flex gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#111965] text-[#F7CE4D]">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-[#E6E8F0] bg-[#F8F9FC] px-4 py-3 text-xs font-semibold text-[#68708A] dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {copy.thinking}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 sm:mx-6 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="border-t border-[#E6E8F0] bg-white px-3 py-3 sm:px-4 dark:border-white/10 dark:bg-[#0B102A]">
          {messages.length > 0 && suggestions.length > 0 && (
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {suggestions.slice(0, 4).map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void send(question)}
                  disabled={isSending}
                  className="shrink-0 rounded-full border border-[#E6E8F0] bg-[#F8F9FC] px-3 py-1.5 text-[10px] font-bold text-[#111965] transition-colors hover:bg-[#F0F2FA] disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <label htmlFor="advisor-question" className="sr-only">
              {copy.placeholder}
            </label>
            <textarea
              id="advisor-question"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={copy.placeholder}
              rows={1}
              maxLength={800}
              className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-[#E6E8F0] bg-[#F8F9FC] px-4 py-3 text-sm text-[#171A2C] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#111965]/40 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#F7CE4D]/40"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={isSending || !input.trim()}
              className="inline-flex h-[48px] shrink-0 items-center gap-2 rounded-2xl bg-[#111965] px-4 text-xs font-black text-white transition-colors hover:bg-[#1A247F] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#F7CE4D] dark:text-[#111965] dark:hover:bg-[#F7CE4D]/90"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{copy.send}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
