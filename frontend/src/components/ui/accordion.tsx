"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  className,
}: AccordionItemProps) {
  const [internalIsOpen, setInternalIsOpen] = React.useState(defaultOpen);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
    if (!isControlled) {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <div
      className={cn(
        "border rounded-2xl bg-white overflow-hidden transition-all duration-300",
        isOpen
          ? "border-[#111965]/40 shadow-[0_10px_28px_rgba(17,25,101,0.08)] ring-1 ring-[#111965]/10"
          : "border-[#E6E8F0] shadow-2xs hover:border-slate-300 hover:shadow-xs",
        className
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-[#111965] hover:bg-slate-50/60 transition-colors cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="group-hover:text-[#1E277A] transition-colors">{title}</span>
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isOpen
              ? "bg-[#111965] text-white rotate-180"
              : "bg-slate-100 text-[#68708A] rotate-0 group-hover:bg-slate-200"
          )}
        >
          <ChevronDown className="w-4 h-4 transition-transform duration-300" />
        </div>
      </button>

      {/* Silky smooth native CSS Grid expand/collapse */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-slate-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Accordion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}
