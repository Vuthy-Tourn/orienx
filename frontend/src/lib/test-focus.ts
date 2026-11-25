"use client";

import { useEffect, useSyncExternalStore } from "react";

export const TEST_FOCUS_EVENT = "orienx:test-focus-change";

export function setTestFocusActive(active: boolean) {
  if (typeof window === "undefined") return;
  if (active) {
    document.documentElement.dataset.testFocus = "true";
  } else {
    delete document.documentElement.dataset.testFocus;
  }
  window.dispatchEvent(new Event(TEST_FOCUS_EVENT));
}

function subscribeTestFocus(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(TEST_FOCUS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener(TEST_FOCUS_EVENT, onStoreChange);
  };
}

function getTestFocusSnapshot(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.testFocus === "true";
}

export function useTestFocusMode(): boolean {
  return useSyncExternalStore(
    subscribeTestFocus,
    getTestFocusSnapshot,
    () => false
  );
}

export function useSyncTestFocus(active: boolean) {
  useEffect(() => {
    setTestFocusActive(active);
    return () => {
      setTestFocusActive(false);
    };
  }, [active]);
}
