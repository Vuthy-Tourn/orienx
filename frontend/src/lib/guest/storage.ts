"use client";

import type {
  GuestProfile,
  GuestResultRecord,
  GuestTestKind,
  PersonalityDraft,
  RiasecDraft,
} from "@/lib/guest/types";

export const GUEST_STORAGE_KEYS = {
  profile: "orienx.guest.profile.v1",
  personalityDraft: "orienx.guest.personality.draft.v1",
  personalityResults: "orienx.guest.personality.results.v1",
  riasecDraft: "orienx.guest.riasec.draft.v1",
  riasecResults: "orienx.guest.riasec.results.v1",
} as const;

const MAX_RESULTS = 10;
const memoryFallback = new Map<string, string>();
let storageWarningShown = false;

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const testKey = "__orienx_guest_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

function readRaw(key: string): string | null {
  const store = storage();
  if (!store) return memoryFallback.get(key) ?? null;
  try {
    return store.getItem(key);
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

function writeRaw(key: string, value: string): boolean {
  const store = storage();
  if (!store) {
    memoryFallback.set(key, value);
    return false;
  }
  try {
    store.setItem(key, value);
    return true;
  } catch {
    memoryFallback.set(key, value);
    return false;
  } finally {
    if (!store && !storageWarningShown && typeof window !== "undefined") {
      storageWarningShown = true;
    }
  }
}

function removeRaw(key: string) {
  memoryFallback.delete(key);
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    // Ignore storage failures; the UI still works with in-memory data.
  }
}

export function isGuestStorageAvailable(): boolean {
  return storage() !== null;
}

function readJson<T>(key: string): T | null {
  const raw = readRaw(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): boolean {
  return writeRaw(key, JSON.stringify(value));
}

export function readProfile(): GuestProfile | null {
  const profile = readJson<GuestProfile>(GUEST_STORAGE_KEYS.profile);
  if (!profile || profile.version !== 1) return null;
  return profile;
}

export function saveProfile(
  profile: Omit<GuestProfile, "version" | "updatedAt">
): boolean {
  return writeJson(GUEST_STORAGE_KEYS.profile, {
    ...profile,
    version: 1,
    updatedAt: new Date().toISOString(),
  } satisfies GuestProfile);
}

export function readPersonalityDraft(): PersonalityDraft | null {
  const draft = readJson<PersonalityDraft>(
    GUEST_STORAGE_KEYS.personalityDraft
  );
  if (!draft || draft.version !== 1) return null;
  return draft;
}

export function savePersonalityDraft(
  draft: Omit<PersonalityDraft, "version" | "updatedAt">
): boolean {
  return writeJson(GUEST_STORAGE_KEYS.personalityDraft, {
    ...draft,
    version: 1,
    updatedAt: new Date().toISOString(),
  } satisfies PersonalityDraft);
}

export function clearPersonalityDraft() {
  removeRaw(GUEST_STORAGE_KEYS.personalityDraft);
}

export function readRiasecDraft(): RiasecDraft | null {
  const draft = readJson<RiasecDraft>(GUEST_STORAGE_KEYS.riasecDraft);
  if (!draft || draft.version !== 1) return null;
  return draft;
}

export function saveRiasecDraft(
  draft: Omit<RiasecDraft, "version" | "updatedAt">
): boolean {
  return writeJson(GUEST_STORAGE_KEYS.riasecDraft, {
    ...draft,
    version: 1,
    updatedAt: new Date().toISOString(),
  } satisfies RiasecDraft);
}

export function clearRiasecDraft() {
  removeRaw(GUEST_STORAGE_KEYS.riasecDraft);
}

function resultKey(kind: GuestTestKind): string {
  return kind === "personality"
    ? GUEST_STORAGE_KEYS.personalityResults
    : GUEST_STORAGE_KEYS.riasecResults;
}

export function readResults(kind: GuestTestKind): GuestResultRecord[] {
  const rows = readJson<GuestResultRecord[]>(resultKey(kind));
  if (!Array.isArray(rows)) return [];
  return rows
    .filter(
      (row) =>
        row &&
        row.schemaVersion === 1 &&
        row.kind === kind &&
        Boolean(row.result)
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
}

export function readLatestResult(
  kind: GuestTestKind
): GuestResultRecord | null {
  return readResults(kind)[0] ?? null;
}

export function saveResult(record: GuestResultRecord): boolean {
  const rows = readResults(record.kind);
  const next = [record, ...rows.filter((row) => row.id !== record.id)].slice(
    0,
    MAX_RESULTS
  );

  let saved = writeJson(resultKey(record.kind), next);
  if (!saved) {
    // Quota can be tight in private browsing. Keep the newest result only.
    saved = writeJson(resultKey(record.kind), [record]);
  }
  return saved;
}

export function deleteResult(kind: GuestTestKind, id: string): boolean {
  const rows = readResults(kind).filter((row) => row.id !== id);
  return writeJson(resultKey(kind), rows);
}

export function clearAllResults(kind: GuestTestKind) {
  removeRaw(resultKey(kind));
}

export function getAllResults(): GuestResultRecord[] {
  return [...readResults("personality"), ...readResults("riasec")].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

export function clearAllGuestData() {
  Object.values(GUEST_STORAGE_KEYS).forEach(removeRaw);
  memoryFallback.clear();
}

export function hasAnyGuestData(): boolean {
  return Boolean(
    readPersonalityDraft() ||
      readRiasecDraft() ||
      readResults("personality").length ||
      readResults("riasec").length ||
      readProfile()
  );
}

export function exportGuestBackup(): string {
  return JSON.stringify(
    {
      app: "OrienX",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      profile: readProfile(),
      personalityDraft: readPersonalityDraft(),
      riasecDraft: readRiasecDraft(),
      personalityResults: readResults("personality"),
      riasecResults: readResults("riasec"),
    },
    null,
    2
  );
}

export function createResultId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `orienx-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
