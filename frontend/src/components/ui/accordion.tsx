"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({ title, children, defaultOpen = false, className }: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("border border-[#E6E8F0] rounded-2xl bg-white overflow-hidden transition-all", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-[#111965] hover:bg-slate-50/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#68708A] transition-transform duration-200 flex-shrink-0 ml-4",
            isOpen && "rotate-180 text-[#111965]"
          )}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#68708A] leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export function Accordion({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}

