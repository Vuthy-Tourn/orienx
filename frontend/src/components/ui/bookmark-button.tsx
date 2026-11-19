"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { IS_STATIC_MODE } from "@/lib/app-mode";

export type EntityType = "major" | "university" | "career" | "scholarship";

export interface BookmarkButtonProps {
  entityType: EntityType;
  entityId: string;
  variant?: "default" | "overlay" | "ghost" | "pill";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  textActive?: string;
  textInactive?: string;
  className?: string;
}

export function BookmarkButton({
  entityType,
  entityId,
  variant = "default",
  size = "sm",
  showText = false,
  textActive = "បានរក្សាទុក",
  textInactive = "រក្សាទុក",
  className = "",
}: BookmarkButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch user favorites
  const { data: favorites } = useQuery({
    queryKey: ["user-favorites"],
    queryFn: async () => {
      try {
        return await apiFetch<any>("/favorites");
      } catch {
        return { majors: [], universities: [], careers: [], scholarships: [] };
      }
    },
    enabled: !!user,
  });

  // Determine list key from entity type
  const listKey =
    entityType === "major"
      ? "majors"
      : entityType === "university"
      ? "universities"
      : entityType === "career"
      ? "careers"
      : "scholarships";

  const isServerBookmarked = Boolean(
    favorites?.[listKey]?.some(
      (item: any) => item.id === entityId || item.slug === entityId
    )
  );

  const [isBookmarked, setIsBookmarked] = useState<boolean>(isServerBookmarked);

  useEffect(() => {
    setIsBookmarked(isServerBookmarked);
  }, [isServerBookmarked]);

  // 2. Toggle Favorite Mutation
  const { mutate: toggleFavorite, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) {
        router.push("/login");
        return;
      }
      return apiFetch("/favorites/toggle", {
        method: "POST",
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId }),
      });
    },
    onMutate: () => {
      if (!user) return;
      setIsBookmarked((prev) => !prev);
    },
    onError: () => {
      // Revert optimistic update
      setIsBookmarked(isServerBookmarked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    toggleFavorite();
  };

  if (IS_STATIC_MODE) {
    return null;
  }

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const currentIconSize = iconSizes[size] || iconSizes.sm;

  if (variant === "overlay") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 p-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
          isBookmarked
            ? "bg-[#FFF9E6] border border-amber-300 text-amber-700 hover:bg-[#FEF0C7] dark:bg-amber-950/40 dark:border-amber-700/60 dark:text-amber-300"
            : "bg-white/95 backdrop-blur-xs border border-white/40 text-slate-600 hover:text-[#111965] hover:bg-white dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-300"
        } ${className}`}
        title={isBookmarked ? "បានរក្សាទុក (Saved)" : "រក្សាទុក (Save to Bookmarks)"}
        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        {isPending ? (
          <Loader2 className={`${currentIconSize} animate-spin text-amber-600`} />
        ) : isBookmarked ? (
          <Bookmark className={`${currentIconSize} text-amber-600 fill-amber-400 dark:text-amber-400 dark:fill-amber-500`} />
        ) : (
          <Bookmark className={currentIconSize} />
        )}
        {showText && <span>{isBookmarked ? textActive : textInactive}</span>}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
          isBookmarked
            ? "text-amber-600 hover:text-amber-700 dark:text-amber-400"
            : "text-[#68708A] hover:text-[#111965] dark:text-slate-400 dark:hover:text-white"
        } ${className}`}
        title={isBookmarked ? "បានរក្សាទុក (Saved)" : "រក្សាទុក (Save to Bookmarks)"}
        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        {isPending ? (
          <Loader2 className={`${currentIconSize} animate-spin`} />
        ) : isBookmarked ? (
          <Bookmark className={`${currentIconSize} text-amber-600 fill-amber-400 dark:text-amber-400 dark:fill-amber-500`} />
        ) : (
          <Bookmark className={currentIconSize} />
        )}
        {showText && <span>{isBookmarked ? textActive : textInactive}</span>}
      </button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
          isBookmarked
            ? "bg-[#FFF9E6] border-amber-300 text-amber-700 shadow-2xs dark:bg-amber-950/40 dark:border-amber-700/60 dark:text-amber-300"
            : "bg-white border-[#E6E8F0] text-[#68708A] hover:text-[#111965] hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
        } ${className}`}
        title={isBookmarked ? "បានរក្សាទុក (Saved)" : "រក្សាទុក (Save to Bookmarks)"}
        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        {isPending ? (
          <Loader2 className={`${currentIconSize} animate-spin`} />
        ) : isBookmarked ? (
          <Bookmark className={`${currentIconSize} text-amber-600 fill-amber-400 dark:text-amber-400 dark:fill-amber-500`} />
        ) : (
          <Bookmark className={currentIconSize} />
        )}
        <span>{isBookmarked ? textActive : textInactive}</span>
      </button>
    );
  }

  // Default button
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`p-1.5 rounded-lg border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
        isBookmarked
          ? "bg-[#FFF9E6] border-amber-300 text-amber-700 shadow-2xs hover:bg-[#FEF0C7] dark:bg-amber-950/40 dark:border-amber-700/60 dark:text-amber-300"
          : "bg-white border-[#E6E8F0] text-slate-400 hover:text-[#111965] hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white"
      } ${className}`}
      title={isBookmarked ? "បានរក្សាទុក (Saved)" : "រក្សាទុក (Save to Bookmarks)"}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isPending ? (
        <Loader2 className={`${currentIconSize} animate-spin`} />
      ) : isBookmarked ? (
        <Bookmark className={`${currentIconSize} text-amber-600 fill-amber-400 dark:text-amber-400 dark:fill-amber-500`} />
      ) : (
        <Bookmark className={currentIconSize} />
      )}
      {showText && <span className="text-xs font-bold">{isBookmarked ? textActive : textInactive}</span>}
    </button>
  );
}

