"use client";
/* eslint-disable @next/next/no-img-element -- previews are local blob URLs owned by this session */
import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SETTINGS, type SlideshowImage, type SlideshowSettings, type TransitionType, type FitMode, type ClockStyle, type ClockPosition } from "@/lib/slideshow/types";
import { importLocalImages, releaseLocalImage } from "@/lib/providers/local-image-provider";
import { importRemoteImage } from "@/lib/providers/remote-image-provider";
import { Icon } from "./icons";
import { ImageLibrary } from "./image-library";
import { SlideshowPlayer } from "./slideshow-player";

type View = "dashboard" | "images" | "settings";
export function ImageSlideshowApp() {
  const [images, setImages] = useState<SlideshowImage[]>([]); const [settings, setSettings] = useState<SlideshowSettings>(DEFAULT_SETTINGS);
  const [view, setView] = useState<View>("dashboard"); const [playerOpen, setPlayerOpen] = useState(false); const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState(""); const inputRef = useRef<HTMLInputElement>(null); const imagesRef = useRef(images);
  const [addDialogOpen, setAddDialogOpen] = useState(false); const [urlValue, setUrlValue] = useState("");
  const [urlLoading, setUrlLoading] = useState(false); const [urlError, setUrlError] = useState("");
  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => () => imagesRef.current.forEach(releaseLocalImage), []);

  const addFiles = useCallback((files: File[]) => {
    const { images: added, rejected } = importLocalImages(files, imagesRef.current.length);
    if (added.length) setImages((current) => [...current, ...added]);
    setNotice(added.length ? `Đã thêm ${added.length} ảnh${rejected.length ? `, bỏ qua ${rejected.length} tệp không hỗ trợ` : ""}.` : "Không tìm thấy tệp ảnh được hỗ trợ.");
    setTimeout(() => setNotice(""), 3500);
  }, []);
  const closeAddDialog = () => { if (urlLoading) return; setAddDialogOpen(false); setUrlError(""); };
  const addUrl = async () => {
    if (!urlValue.trim() || urlLoading) return;
    setUrlLoading(true); setUrlError("");
    try {
      const image = await importRemoteImage(urlValue, imagesRef.current.length);
      setImages((current) => [...current, { ...image, order: current.length }]);
      setNotice("Đã thêm 1 ảnh từ URL."); setTimeout(() => setNotice(""), 3500);
      setUrlValue(""); setAddDialogOpen(false);
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : "Không thể thêm ảnh từ URL.");
    } finally {
      setUrlLoading(false);
    }
  };
  const removeImage = (id: string) => setImages((current) => { const target = current.find((image) => image.id === id); if (target) releaseLocalImage(target); return current.filter((image) => image.id !== id).map((image, order) => ({ ...image, order })); });
  const toggleImage = (id: string) => setImages((current) => current.map((image) => image.id === id ? { ...image, enabled: !image.enabled } : image));
  const reorder = (from: string, to: string) => setImages((current) => { const list = [...current]; const fromIndex = list.findIndex((item) => item.id === from); const toIndex = list.findIndex((item) => item.id === to); if (fromIndex < 0 || toIndex < 0) return current; const [moved] = list.splice(fromIndex, 1); list.splice(toIndex, 0, moved); return list.map((image, order) => ({ ...image, order })); });
  const updateSettings = <K extends keyof SlideshowSettings>(key: K, value: SlideshowSettings[K]) => setSettings((current) => ({ ...current, [key]: value }));
  const enabledCount = images.filter((image) => image.enabled && image.status !== "error").length;

  return <div className="app-shell" onDragEnter={(event) => { if (event.dataTransfer.types.includes("Files")) setDragging(true); }}>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml" multiple hidden onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); setAddDialogOpen(false); event.target.value = ""; }}/>
    <aside className="sidebar">
      <div className="brand"><span><Icon name="logo"/></span><div><strong>Lumina</strong><small>Image Slideshow</small></div></div>
      <nav><Nav active={view === "dashboard"} icon="home" label="Tổng quan" onClick={() => setView("dashboard")}/><Nav active={view === "images"} icon="image" label="Thư viện ảnh" badge={images.length || undefined} onClick={() => setView("images")}/><Nav icon="playlist" label="Playlist" disabled/><Nav active={view === "settings"} icon="settings" label="Cài đặt" onClick={() => setView("settings")}/></nav>
      <div className="sidebar-card"><span className="status-dot"/><div><strong>Sẵn sàng trình chiếu</strong><small>{enabledCount} ảnh đang hoạt động</small></div></div>
      <div className="sidebar-footer"><div className="avatar">L</div><div><strong>Không gian cá nhân</strong><small>Lưu cục bộ trên thiết bị</small></div></div>
    </aside>
    <main className="content">
      <header className="topbar"><div><span className="mobile-logo"><Icon name="logo"/></span><strong>{view === "dashboard" ? "Tổng quan" : view === "images" ? "Thư viện ảnh" : "Cài đặt trình chiếu"}</strong></div><button className="button primary" onClick={() => setAddDialogOpen(true)}><Icon name="plus"/> Thêm ảnh</button></header>
      {view === "dashboard" && <Dashboard
        images={images}
        enabledCount={enabledCount}
        settings={settings}
        onUpload={() => setAddDialogOpen(true)}
        onStart={() => enabledCount && setPlayerOpen(true)}
        onOpenLibrary={() => setView("images")}
        onOpenSettings={() => setView("settings")}
      />}
      {view === "images" && <section className="page-section"><div className="section-heading"><div><p className="eyebrow">BỘ SƯU TẬP CỦA BẠN</p><h1>Thư viện ảnh</h1><p>Kéo thả để đổi thứ tự. Chạm vào ảnh để bật hoặc tắt khỏi trình chiếu.</p></div><span>{images.length} ảnh</span></div><ImageLibrary images={images} onUpload={() => setAddDialogOpen(true)} onRemove={removeImage} onToggle={toggleImage} onReorder={reorder}/></section>}
      {view === "settings" && <Settings settings={settings} update={updateSettings}/>} 
    </main>
    <nav className="mobile-nav"><Nav active={view === "dashboard"} icon="home" label="Tổng quan" onClick={() => setView("dashboard")}/><Nav active={view === "images"} icon="image" label="Thư viện" onClick={() => setView("images")}/><Nav active={view === "settings"} icon="settings" label="Cài đặt" onClick={() => setView("settings")}/></nav>
    {dragging && <div className="drop-overlay" onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(Array.from(event.dataTransfer.files)); }}><div><Icon name="upload"/><h2>Thả ảnh vào đây</h2><p>Ảnh chỉ được xử lý trên thiết bị của bạn</p></div></div>}
    {addDialogOpen && <div className="modal-backdrop" onMouseDown={closeAddDialog}><div className="add-image-dialog" role="dialog" aria-modal="true" aria-labelledby="add-image-title" onMouseDown={(event) => event.stopPropagation()}><div className="dialog-heading"><div><p className="eyebrow">NGUỒN HÌNH ẢNH</p><h2 id="add-image-title">Thêm ảnh</h2></div><button className="icon-button" onClick={closeAddDialog} aria-label="Đóng"><Icon name="close"/></button></div><button className="device-source" onClick={() => inputRef.current?.click()}><span><Icon name="upload"/></span><div><strong>Chọn từ thiết bị</strong><small>JPG, PNG, WebP, GIF, AVIF hoặc SVG</small></div><Icon name="chevron"/></button><div className="source-divider"><span>hoặc thêm từ URL trực tiếp</span></div><form onSubmit={(event) => { event.preventDefault(); void addUrl(); }}><label htmlFor="image-url">URL hình ảnh</label><div className="url-row"><input id="image-url" type="url" inputMode="url" placeholder="https://example.com/image.jpg" value={urlValue} disabled={urlLoading} onChange={(event) => { setUrlValue(event.target.value); setUrlError(""); }} autoFocus/><button className="button primary" type="submit" disabled={!urlValue.trim() || urlLoading}>{urlLoading ? "Đang kiểm tra…" : "Thêm URL"}</button></div>{urlError && <p className="url-error" role="alert">{urlError}</p>}<p className="url-help">Dùng URL ảnh trực tiếp. Link trang chia sẻ từ Drive, OneDrive hoặc Dropbox có thể không hoạt động.</p></form></div></div>}
    {notice && <div className="toast">{notice}</div>}
    <SlideshowPlayer images={images} settings={settings} open={playerOpen} onClose={() => setPlayerOpen(false)} onImageError={(id) => setImages((current) => current.map((image) => image.id === id ? { ...image, status: "error" } : image))}/>
  </div>;
}

function Nav({ icon, label, active, badge, disabled, onClick }: { icon: string; label: string; active?: boolean; badge?: number; disabled?: boolean; onClick?: () => void }) { return <button className={`nav-item ${active ? "active" : ""}`} disabled={disabled} onClick={onClick}><Icon name={icon}/><span>{label}</span>{badge ? <b>{badge}</b> : null}{disabled ? <small>Sắp có</small> : null}</button>; }

function Dashboard({ images, enabledCount, settings, onUpload, onStart, onOpenLibrary, onOpenSettings }: { images: SlideshowImage[]; enabledCount: number; settings: SlideshowSettings; onUpload: () => void; onStart: () => void; onOpenLibrary: () => void; onOpenSettings: () => void }) {
  return <section className="dashboard page-section"><div className="hero"><div><span className="hero-pill"><i/> Sẵn sàng phát</span><h1>Biến khoảnh khắc thành<br/><em>những câu chuyện.</em></h1><p>Tạo trình chiếu tuyệt đẹp từ những bức ảnh của bạn. Riêng tư, mượt mà và hoàn toàn trên thiết bị.</p><div className="hero-actions"><button className="button primary large" disabled={!enabledCount} onClick={onStart}><Icon name="play"/> Bắt đầu trình chiếu</button><button className="button secondary large" onClick={onUpload}><Icon name="plus"/> Thêm ảnh</button></div></div><div className="hero-preview">{images.slice(0, 3).map((image, index) => <img key={image.id} src={image.url} alt="" referrerPolicy="no-referrer" style={{ transform: `rotate(${[-7, 5, 0][index]}deg)` }}/>) }{!images.length && <div className="preview-placeholder"><Icon name="image"/><span>Ảnh của bạn sẽ xuất hiện ở đây</span></div>}<span className="floating-badge"><Icon name="play"/> {enabledCount} ảnh</span></div></div>
    <div className="stats"><Stat icon="image" color="violet" value={images.length} label="Tổng số ảnh" note={images.length ? "Sẵn sàng trong thư viện" : "Hãy thêm ảnh đầu tiên"}/><Stat icon="playlist" color="blue" value="01" label="Playlist" note="Playlist hiện tại"/><Stat icon="settings" color="amber" value={`${settings.durationMs / 1000}s`} label="Mỗi slide" note="Hiệu ứng chuyển ảnh"/></div>
    <div className="dashboard-grid"><div className="panel recent"><div className="panel-title"><div><h2>Ảnh gần đây</h2><p>Những ảnh vừa được thêm</p></div><button onClick={onOpenLibrary}>Xem tất cả <Icon name="chevron"/></button></div>{images.length ? <div className="recent-strip">{images.slice(-5).reverse().map((image) => <img key={image.id} src={image.url} alt={image.name} referrerPolicy="no-referrer"/>)}</div> : <div className="compact-empty"><Icon name="image"/><span>Chưa có ảnh nào trong thư viện</span></div>}</div><div className="panel quick"><div className="panel-title"><div><h2>Cài đặt nhanh</h2><p>Tinh chỉnh trải nghiệm</p></div><button onClick={onOpenSettings}>Mở <Icon name="chevron"/></button></div><div className="quick-row"><span>Thời gian mỗi ảnh</span><strong>{settings.durationMs / 1000} giây</strong></div><div className="quick-row"><span>Hiệu ứng</span><strong>{transitionLabel[settings.transition]}</strong></div><div className="quick-row"><span>Lặp lại</span><strong className={settings.loop ? "success" : ""}>{settings.loop ? "Đang bật" : "Đã tắt"}</strong></div></div></div>
  </section>;
}
function Stat({ icon, color, value, label, note }: { icon: string; color: string; value: string | number; label: string; note: string }) { return <div className="stat-card"><span className={`stat-icon ${color}`}><Icon name={icon}/></span><div><strong>{value}</strong><span>{label}</span><small>{note}</small></div></div>; }
const transitionLabel: Record<TransitionType, string> = { none: "Không", fade: "Mờ dần", "slide-left": "Trượt trái", "slide-right": "Trượt phải", zoom: "Thu phóng", random: "Ngẫu nhiên" };
const fitLabel: Record<FitMode, string> = { contain: "Vừa khung", cover: "Lấp đầy", fill: "Kéo giãn" };
const clockStyleLabel: Record<ClockStyle, string> = { digital: "Đồng hồ số", analog: "Đồng hồ tròn" };
const clockPositionLabel: Record<ClockPosition, string> = { "top-left": "Trên trái", "top-right": "Trên phải", "bottom-left": "Dưới trái", "bottom-right": "Dưới phải" };

function Settings({ settings, update }: { settings: SlideshowSettings; update: <K extends keyof SlideshowSettings>(key: K, value: SlideshowSettings[K]) => void }) {
  return <section className="page-section settings-page"><div className="section-heading"><div><p className="eyebrow">TRẢI NGHIỆM PHÁT</p><h1>Cài đặt trình chiếu</h1><p>Thay đổi được áp dụng ngay cả khi trình chiếu đang chạy.</p></div></div><div className="settings-grid">
    <div className="panel setting-card"><h2>Thời gian & phát lại</h2><label><span>Thời gian mỗi ảnh <b>{settings.durationMs / 1000} giây</b></span><input type="range" min="1" max="300" value={settings.durationMs / 1000} onChange={(e) => update("durationMs", Number(e.target.value) * 1000)}/></label><Toggle label="Tự động phát" value={settings.autoplay} onChange={(value) => update("autoplay", value)}/><Toggle label="Lặp vô hạn" value={settings.loop} onChange={(value) => update("loop", value)}/></div>
    <div className="panel setting-card"><h2>Hiển thị & chuyển cảnh</h2><label><span>Hiệu ứng chuyển ảnh</span><select value={settings.transition} onChange={(e) => update("transition", e.target.value as TransitionType)}>{Object.entries(transitionLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span>Thời gian hiệu ứng <b>{settings.transitionMs} ms</b></span><input type="range" min="0" max="2000" step="100" value={settings.transitionMs} onChange={(e) => update("transitionMs", Number(e.target.value))}/></label><label><span>Chế độ ảnh</span><select value={settings.fitMode} onChange={(e) => update("fitMode", e.target.value as FitMode)}>{Object.entries(fitLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
    <div className="panel setting-card clock-settings"><h2>Đồng hồ & lịch</h2><Toggle label="Hiển thị đồng hồ" value={settings.showClock} onChange={(value) => update("showClock", value)}/><label><span>Kiểu đồng hồ</span><select value={settings.clockStyle} disabled={!settings.showClock} onChange={(e) => update("clockStyle", e.target.value as ClockStyle)}>{Object.entries(clockStyleLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span>Vị trí</span><select value={settings.clockPosition} disabled={!settings.showClock} onChange={(e) => update("clockPosition", e.target.value as ClockPosition)}>{Object.entries(clockPositionLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><Toggle label="Hiện giây" value={settings.showSeconds} onChange={(value) => update("showSeconds", value)}/><Toggle label="Định dạng 24 giờ" value={settings.use24Hour} onChange={(value) => update("use24Hour", value)}/><Toggle label="Hiện dương lịch" value={settings.showSolarDate} onChange={(value) => update("showSolarDate", value)}/><Toggle label="Hiện âm lịch Việt Nam" value={settings.showLunarDate} onChange={(value) => update("showLunarDate", value)}/></div>
  </div></section>;
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) { return <label className="toggle-row"><span>{label}</span><button type="button" role="switch" aria-checked={value} className={`toggle ${value ? "on" : ""}`} onClick={() => onChange(!value)}><i/></button></label>; }
