"use client";

import { useCallback, useEffect, useState } from "react";
import { totalLessons } from "@/content/lessons";

const STORAGE_KEY = "curso-claude-progress-v1";

interface ProgressState {
  completedDays: number[];
  lastVisitedDay: number | null;
}

function readStorage(): ProgressState {
  if (typeof window === "undefined") {
    return { completedDays: [], lastVisitedDay: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedDays: [], lastVisitedDay: null };
    const parsed = JSON.parse(raw) as ProgressState;
    return {
      completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays : [],
      lastVisitedDay: typeof parsed.lastVisitedDay === "number" ? parsed.lastVisitedDay : null,
    };
  } catch {
    return { completedDays: [], lastVisitedDay: null };
  }
}

function writeStorage(state: ProgressState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Fallo de localStorage (Req 8.6): se ignora para no interrumpir la navegación.
  }
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>({ completedDays: [], lastVisitedDay: null });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStorage());
    setHydrated(true);
  }, []);

  const markVisited = useCallback((day: number) => {
    setState((prev) => {
      const next = { ...prev, lastVisitedDay: day };
      writeStorage(next);
      return next;
    });
  }, []);

  const toggleComplete = useCallback((day: number) => {
    setState((prev) => {
      const isCompleted = prev.completedDays.includes(day);
      const completedDays = isCompleted
        ? prev.completedDays.filter((d) => d !== day)
        : [...prev.completedDays, day].sort((a, b) => a - b);
      const next = { ...prev, completedDays };
      writeStorage(next);
      return next;
    });
  }, []);

  const isCompleted = useCallback(
    (day: number) => state.completedDays.includes(day),
    [state.completedDays]
  );

  const progressPercent =
    hydrated && totalLessons > 0
      ? Math.round((state.completedDays.length / totalLessons) * 100)
      : 0;

  return {
    hydrated,
    completedDays: state.completedDays,
    lastVisitedDay: state.lastVisitedDay,
    progressPercent,
    isCompleted,
    markVisited,
    toggleComplete,
  };
}
