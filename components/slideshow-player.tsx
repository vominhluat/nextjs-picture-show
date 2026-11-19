"use client";
/* eslint-disable @next/next/no-img-element -- slideshow sources include local blob URLs */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSlideshow } from "@/hooks/use-slideshow";
import type { SlideshowImage, SlideshowSettings, TransitionType } from "@/lib/slideshow/types";
import { Icon } from "./icons";
import { SlideshowClock } from "./slideshow-clock";

interface Props { images: SlideshowImage[]; settings: SlideshowSettings; open: boolean; onClose: () => void; onImageError: (id: string) => void }
const randomTransitions: TransitionType[] = ["fade", "slide-left", "slide-right", "zoom"];

export function SlideshowPlayer({ images, settings, open, onClose, onImageError }: Props) {
  const player = useSlideshow(images, settings, open); const rootRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null); const [controlsVisible, setControlsVisible] = useState(true);
  const transition = useMemo(() => settings.transition === "random" ? randomTransitions[player.index % randomTransitions.length] : settings.transition, [player.index, settings.transition]);
  const showControls = useCallback(() => { setControlsVisible(true); if (hideTimer.current) clearTimeout(hideTimer.current); hideTimer.current = setTimeout(() => setControlsVisible(false), 3000); }, []);
  const toggleFullscreen = useCallback(async () => { if (!document.fullscreenElement) await rootRef.current?.requestFullscreen(); else await document.exitFullscreen(); }, []);

  useEffect(() => { if (!open) return; hideTimer.current = setTimeout(() => setControlsVisible(false), 3000); return () => { if (hideTimer.current) clearTimeout(hideTimer.current); }; }, [open]);
  useEffect(() => {
    if (!open) return;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === " ") { event.preventDefault(); if (player.playing) player.pause(); else player.play(); }
      else if (event.key === "ArrowRight") player.next(); else if (event.key === "ArrowLeft") player.previous();
      else if (event.key === "Escape" && !document.fullscreenElement) onClose(); else return;
      showControls();
    };
    window.addEventListener("keydown", keydown); return () => window.removeEventListener("keydown", keydown);
  }, [onClose, open, player, showControls]);
  useEffect(() => {
    if (!open || !player.playable.length) return;
    const preload = [1, 2].map((offset) => player.playable[(player.index + offset) % player.playable.length]).filter(Boolean).map((item) => { const image = new Image(); image.referrerPolicy = "no-referrer"; image.src = item.url; return image; });
    return () => preload.forEach((image) => { image.src = ""; });
  }, [open, player.index, player.playable]);
  if (!open) return null;
  const progress = player.duration ? Math.max(0, Math.min(100, ((player.duration - player.remainingMs) / player.duration) * 100)) : 0;

  return <div ref={rootRef} className={`player ${controlsVisible ? "controls-visible" : ""}`} onPointerMove={showControls} onPointerDown={showControls}>
    {/* Local blob URLs need native img elements and must not pass through an image optimizer. */}
    {player.current ? <div className="player-media"><img key={player.current.id} src={player.current.url} alt={player.current.name} referrerPolicy="no-referrer" className={`player-image transition-${transition} fit-${settings.fitMode}`} style={{ animationDuration: `${settings.transitionMs}ms` }} onError={() => onImageError(player.current!.id)} /></div> : <div className="player-empty"><Icon name="image"/><h2>Không còn ảnh có thể phát</h2><p>Hãy kiểm tra lại thư viện ảnh.</p></div>}
    <SlideshowClock settings={settings}/>
    <div className="player-top player-chrome"><span className="brand-mark"><Icon name="logo"/> Lumina</span><button className="icon-button" onClick={onClose} aria-label="Đóng trình chiếu"><Icon name="close"/></button></div>
    <div className="player-bottom player-chrome">
      <div className="progress-track"><span style={{ width: `${progress}%` }}/></div>
      <div className="player-actions">
        <button onClick={player.restart} aria-label="Phát lại"><Icon name="restart"/></button><button onClick={player.previous} aria-label="Ảnh trước"><Icon name="previous"/></button>
        <button className="primary-control" onClick={player.playing ? player.pause : player.play} aria-label={player.playing ? "Tạm dừng" : "Phát"}><Icon name={player.playing ? "pause" : "play"}/></button>
        <button onClick={player.next} aria-label="Ảnh tiếp"><Icon name="next"/></button><button onClick={toggleFullscreen} aria-label="Toàn màn hình"><Icon name="fullscreen"/></button>
      </div>
    </div>
  </div>;
}
