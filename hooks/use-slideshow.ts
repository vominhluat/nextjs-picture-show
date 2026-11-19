"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SlideshowImage, SlideshowSettings } from "@/lib/slideshow/types";

export function useSlideshow(images: SlideshowImage[], settings: SlideshowSettings, open: boolean) {
  const playable = useMemo(() => images.filter((image) => image.enabled && image.status !== "error"), [images]);
  const [index, setIndex] = useState(0); const [playing, setPlaying] = useState(settings.autoplay);
  const [remainingMs, setRemainingMs] = useState(settings.durationMs); const deadlineRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null); const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timingKeyRef = useRef("");
  const safeIndex = playable.length ? Math.min(index, playable.length - 1) : 0;
  const current = playable[safeIndex];
  const duration = settings.usePerImageDuration && current?.durationMs ? current.durationMs : settings.durationMs;
  const clearTimers = useCallback(() => { if (timerRef.current) clearTimeout(timerRef.current); if (tickerRef.current) clearInterval(tickerRef.current); timerRef.current = null; tickerRef.current = null; }, []);
  const goTo = useCallback((nextIndex: number) => { if (!playable.length) return; setIndex(((nextIndex % playable.length) + playable.length) % playable.length); setRemainingMs(duration); }, [duration, playable.length]);
  const next = useCallback(() => { if (!playable.length) return; setIndex((value) => { if (value >= playable.length - 1) { if (!settings.loop) { setPlaying(false); return value; } return 0; } return value + 1; }); setRemainingMs(duration); }, [duration, playable.length, settings.loop]);
  const previous = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);
  const restart = useCallback(() => { setIndex(0); setRemainingMs(duration); setPlaying(true); }, [duration]);
  const pause = useCallback(() => { setRemainingMs(Math.max(0, deadlineRef.current - performance.now())); setPlaying(false); }, []);
  const play = useCallback(() => { if (playable.length) setPlaying(true); }, [playable.length]);
  useEffect(() => {
    clearTimers(); if (!open || !playing || !current) return;
    const timingKey = `${current.id}:${duration}`;
    const wait = Math.max(20, timingKeyRef.current === timingKey ? (remainingMs || duration) : duration);
    timingKeyRef.current = timingKey; deadlineRef.current = performance.now() + wait;
    timerRef.current = setTimeout(next, wait); tickerRef.current = setInterval(() => setRemainingMs(Math.max(0, deadlineRef.current - performance.now())), 100);
    return clearTimers;
    // remainingMs is captured only when playback starts; ticker updates must not recreate the timeout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTimers, current, duration, next, open, playing]);
  useEffect(() => clearTimers, [clearTimers]);
  return { playable, current, index: safeIndex, playing, remainingMs, duration, play, pause, next, previous, restart, goTo };
}
