import type { SlideshowImage } from "@/lib/slideshow/types";

const LOAD_TIMEOUT_MS = 15_000;

function parseImageUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("URL không hợp lệ.");
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Chỉ hỗ trợ URL bắt đầu bằng http:// hoặc https://.");
  if (url.username || url.password) throw new Error("URL không được chứa thông tin đăng nhập.");
  return url;
}

function imageName(url: URL) {
  const segment = url.pathname.split("/").filter(Boolean).at(-1);
  if (!segment) return url.hostname;
  try {
    return decodeURIComponent(segment) || url.hostname;
  } catch {
    return segment;
  }
}

export function importRemoteImage(value: string, order: number): Promise<SlideshowImage> {
  const url = parseImageUrl(value);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.referrerPolicy = "no-referrer";
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Ảnh tải quá lâu. Hãy kiểm tra lại URL."));
    }, LOAD_TIMEOUT_MS);
    const cleanup = () => {
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
    };
    image.onload = () => {
      cleanup();
      if (!image.naturalWidth || !image.naturalHeight) {
        reject(new Error("URL không trả về một hình ảnh hợp lệ."));
        return;
      }
      resolve({
        id: `remote-${crypto.randomUUID()}`,
        name: imageName(url),
        sourceId: url.origin,
        sourceName: "Từ URL",
        url: url.href,
        order,
        enabled: true,
        status: "ready",
        width: image.naturalWidth,
        height: image.naturalHeight,
        createdAt: Date.now(),
      });
    };
    image.onerror = () => {
      cleanup();
      reject(new Error("Không thể tải ảnh. URL có thể là trang chia sẻ hoặc máy chủ đã chặn truy cập."));
    };
    image.src = url.href;
  });
}
