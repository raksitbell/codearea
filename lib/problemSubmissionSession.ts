import type { FullSubmitResponse } from "@/lib/questionSubmitApi";

export type StoredProblemSubmission = {
  problemSlug: string;
  sourceCode: string;
  language?: string;
  result: FullSubmitResponse;
  storedAt: number;
};

function storageKey(problemSlug: string) {
  return `codearea:lastSubmission:${problemSlug}`;
}

export function storeLastProblemSubmission(
  payload: Omit<StoredProblemSubmission, "storedAt">,
): void {
  const full: StoredProblemSubmission = {
    ...payload,
    storedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(storageKey(payload.problemSlug), JSON.stringify(full));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readLastProblemSubmission(
  problemSlug: string,
): StoredProblemSubmission | null {
  try {
    const raw = sessionStorage.getItem(storageKey(problemSlug));
    if (!raw) return null;
    const payload = JSON.parse(raw) as StoredProblemSubmission;
    if (!payload?.result || typeof payload.sourceCode !== "string") return null;
    if (payload.problemSlug !== problemSlug) return null;
    return payload;
  } catch {
    return null;
  }
}

export function clearLastProblemSubmission(problemSlug: string): void {
  try {
    sessionStorage.removeItem(storageKey(problemSlug));
  } catch {
    /* ignore */
  }
}
