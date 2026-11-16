"use client";

import React, { useMemo } from "react";
import {
  ToastProvider as HeroToastProvider,
  addToast,
  closeAll,
  closeToast,
} from "@heroui/toast";

export interface ToastOptions {
  description?: string;
  duration?: number;
}

interface ToastApi {
  success: (message: string, options?: ToastOptions) => string | null;
  error: (message: string, options?: ToastOptions) => string | null;
  warning: (message: string, options?: ToastOptions) => string | null;
  info: (message: string, options?: ToastOptions) => string | null;
  message: (message: string, options?: ToastOptions) => string | null;
  dismiss: (id: string) => void;
  clear: () => void;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <HeroToastProvider
        placement="top-right"
        maxVisibleToasts={4}
        toastOffset={80}
        toastProps={{
          variant: "flat",
          radius: "lg",
          timeout: 4200,
          shouldShowTimeoutProgress: true,
        }}
      />
    </>
  );
}

/**
 * Thin OrienX wrapper around HeroUI's toast API.
 *
 * `message` is a neutral default toast; `info` uses the primary color.
 */
export function useToast() {
  return useMemo<ToastApi>(
    () => ({
      success: (message, options) =>
        addToast({
          title: message,
          description: options?.description,
          color: "success",
          timeout: options?.duration ?? 4000,
          shouldShowTimeoutProgress: true,
        }),
      error: (message, options) =>
        addToast({
          title: message,
          description: options?.description,
          color: "danger",
          timeout: options?.duration ?? 5600,
          shouldShowTimeoutProgress: true,
        }),
      warning: (message, options) =>
        addToast({
          title: message,
          description: options?.description,
          color: "warning",
          timeout: options?.duration ?? 4800,
          shouldShowTimeoutProgress: true,
        }),
      info: (message, options) =>
        addToast({
          title: message,
          description: options?.description,
          color: "primary",
          timeout: options?.duration ?? 4200,
          shouldShowTimeoutProgress: true,
        }),
      message: (message, options) =>
        addToast({
          title: message,
          description: options?.description,
          color: "default",
          timeout: options?.duration ?? 4200,
          shouldShowTimeoutProgress: true,
        }),
      dismiss: (id) => closeToast(id),
      clear: () => closeAll(),
    }),
    []
  );
}
