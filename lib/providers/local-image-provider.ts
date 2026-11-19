import type { SlideshowImage } from "@/lib/slideshow/types";

const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"]);
export interface LocalImportResult { images: SlideshowImage[]; rejected: string[] }

export function importLocalImages(files: File[], startOrder = 0): LocalImportResult {
  const images: SlideshowImage[] = []; const rejected: string[] = [];
  for (const file of files) {
    if (!SUPPORTED_TYPES.has(file.type)) { rejected.push(file.name); continue; }
    images.push({ id: `local-${crypto.randomUUID()}`, name: file.name, sourceId: "local-device",
      sourceName: "Thiết bị này", url: URL.createObjectURL(file), order: startOrder + images.length,
      enabled: true, status: "ready", createdAt: file.lastModified || Date.now() });
  }
  return { images, rejected };
}

export function releaseLocalImage(image: SlideshowImage) {
  if (image.sourceId === "local-device" && image.url.startsWith("blob:")) URL.revokeObjectURL(image.url);
}
