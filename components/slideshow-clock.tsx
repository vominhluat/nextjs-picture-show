"use client";
import { useEffect, useMemo, useState } from "react";
import type { SlideshowSettings } from "@/lib/slideshow/types";
import { lunarYearName, solarToVietnameseLunar } from "@/lib/calendar/vietnamese-lunar";

export function SlideshowClock({ settings }: { settings: SlideshowSettings }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const lunar = useMemo(() => now ? solarToVietnameseLunar(now) : null, [now]);
  if (!settings.showClock || !now || !lunar) return null;
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit", minute: "2-digit", second: settings.showSeconds ? "2-digit" : undefined,
    hour12: !settings.use24Hour,
  }).format(now);
  const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(now);
  const solarDate = `${weekday}, ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()}`;
  const lunarDate = `Ngày ${lunar.day} tháng ${lunar.month}${lunar.leap ? " nhuận" : ""} năm ${lunarYearName(lunar.year)}`;
  return <aside className={`slideshow-clock clock-${settings.clockPosition} ${settings.clockStyle}`} aria-label={`Đồng hồ: ${time}`}>
    {settings.clockStyle === "digital" ? <strong className="digital-time">{time}</strong> : <AnalogClock date={now} showSeconds={settings.showSeconds}/>} 
    {(settings.showSolarDate || settings.showLunarDate) && <div className="clock-calendar">
      {settings.showSolarDate && <span>{solarDate}</span>}
      {settings.showLunarDate && <span>{lunarDate}</span>}
    </div>}
  </aside>;
}

function AnalogClock({ date, showSeconds }: { date: Date; showSeconds: boolean }) {
  const second = date.getSeconds() * 6;
  const minute = date.getMinutes() * 6 + date.getSeconds() * 0.1;
  const hour = (date.getHours() % 12) * 30 + date.getMinutes() * 0.5;
  return <svg className="analog-clock" viewBox="0 0 120 120" aria-hidden="true">
    <circle className="clock-face" cx="60" cy="60" r="56"/>
    {Array.from({ length: 12 }, (_, index) => <line key={index} className="clock-tick" x1="60" y1="9" x2="60" y2={index % 3 === 0 ? "17" : "14"} transform={`rotate(${index * 30} 60 60)`}/>) }
    <line className="clock-hand hour" x1="60" y1="60" x2="60" y2="34" transform={`rotate(${hour} 60 60)`}/>
    <line className="clock-hand minute" x1="60" y1="60" x2="60" y2="23" transform={`rotate(${minute} 60 60)`}/>
    {showSeconds && <line className="clock-hand second" x1="60" y1="66" x2="60" y2="17" transform={`rotate(${second} 60 60)`}/>} 
    <circle className="clock-pin" cx="60" cy="60" r="3"/>
  </svg>;
}
