export type ImageStatus = "ready" | "loading" | "error";
export type TransitionType = "none" | "fade" | "slide-left" | "slide-right" | "zoom" | "random";
export type FitMode = "contain" | "cover" | "fill" | "none";

export interface SlideshowImage {
  id: string; name: string; sourceId: string; sourceName: string; url: string;
  order: number; enabled: boolean; status: ImageStatus; width?: number; height?: number;
  durationMs?: number; createdAt: number;
}

export interface SlideshowSettings {
  durationMs: number; transition: TransitionType; transitionMs: number; fitMode: FitMode;
  autoplay: boolean; loop: boolean; showName: boolean; usePerImageDuration: boolean;
}

export const DEFAULT_SETTINGS: SlideshowSettings = {
  durationMs: 5_000, transition: "fade", transitionMs: 500, fitMode: "contain",
  autoplay: true, loop: true, showName: true, usePerImageDuration: false,
};
