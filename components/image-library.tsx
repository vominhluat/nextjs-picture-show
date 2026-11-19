"use client";
/* eslint-disable @next/next/no-img-element -- local blob URLs cannot use the server image optimizer */
import type { DragEvent } from "react";
import type { SlideshowImage } from "@/lib/slideshow/types";
import { Icon } from "./icons";

interface Props { images: SlideshowImage[]; onUpload: () => void; onRemove: (id: string) => void; onToggle: (id: string) => void; onReorder: (from: string, to: string) => void }
export function ImageLibrary({ images, onUpload, onRemove, onToggle, onReorder }: Props) {
  const drop = (event: DragEvent, target: string) => { event.preventDefault(); const source = event.dataTransfer.getData("image-id"); if (source) onReorder(source, target); };
  if (!images.length) return <div className="library-empty"><div className="empty-art"><Icon name="image"/></div><h3>Thư viện đang trống</h3><p>Thêm ảnh từ thiết bị để bắt đầu tạo trình chiếu của bạn.</p><button className="button primary" onClick={onUpload}><Icon name="plus"/> Thêm ảnh đầu tiên</button></div>;
  return <div className="image-grid">{images.map((image) => <article key={image.id} className={`image-card ${image.enabled ? "" : "disabled"}`} draggable onDragStart={(event) => event.dataTransfer.setData("image-id", image.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, image.id)}>
    <button className="thumb" onClick={() => onToggle(image.id)} aria-label={image.enabled ? `Tắt ${image.name}` : `Bật ${image.name}`}><img src={image.url} alt={image.name} loading="lazy" referrerPolicy="no-referrer"/><span className="enable-state">{image.enabled ? "Đang dùng" : "Đã tắt"}</span></button>
    <div className="image-card-info"><div><strong title={image.name}>{image.name}</strong><span>{image.sourceName}</span></div><button className="icon-button danger" onClick={() => onRemove(image.id)} aria-label={`Xóa ${image.name}`}><Icon name="trash"/></button></div>
  </article>)}</div>;
}
