export type ImageStatus = "ready" | "loading" | "error";
export type TransitionType = "none" | "fade" | "slide-left" | "slide-right" | "zoom" | "random";
export type FitMode = "contain" | "cover" | "fill";
export type ClockStyle = "digital" | "analog";
export type ClockPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface SlideshowImage {
  id: string; name: string; sourceId: string; sourceName: string; url: string;
  order: number; enabled: boolean; status: ImageStatus; width?: number; height?: number;
  durationMs?: number; createdAt: number;
}

export interface SlideshowSettings {
  durationMs: number; transition: TransitionType; transitionMs: number; fitMode: FitMode;
  autoplay: boolean; loop: boolean; usePerImageDuration: boolean;
  showClock: boolean; clockStyle: ClockStyle; clockPosition: ClockPosition;
  showSeconds: boolean; showSolarDate: boolean; showLunarDate: boolean; use24Hour: boolean;
}

export const DEFAULT_SETTINGS: SlideshowSettings = {
  durationMs: 60_000, transition: "fade", transitionMs: 500, fitMode: "contain",
  autoplay: true, loop: true, usePerImageDuration: false,
  showClock: true, clockStyle: "digital", clockPosition: "bottom-right",
  showSeconds: false, showSolarDate: true, showLunarDate: true, use24Hour: true,
};
