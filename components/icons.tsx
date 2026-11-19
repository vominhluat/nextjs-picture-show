import type { ReactNode, SVGProps } from "react";
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: string }) {
  const paths: Record<string, ReactNode> = {
    logo: <><rect x="3" y="5" width="15" height="15" rx="3"/><path d="M8 5V3h11a2 2 0 0 1 2 2v11h-3"/><path d="m9.5 9 5 3-5 3V9Z" fill="currentColor" stroke="none"/></>, home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m3 17 5-4 4 3 3-2 6 5"/></>, playlist: <><path d="M4 6h11M4 12h11M4 18h8"/><path d="m18 15 3 2-3 2v-4Z"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/></>, upload: <><path d="M12 16V4m-4 4 4-4 4 4"/><path d="M5 14v5h14v-5"/></>,
    play: <path d="m8 5 11 7-11 7V5Z"/>, pause: <path d="M9 5v14M15 5v14"/>, next: <><path d="m6 5 9 7-9 7V5ZM18 5v14"/></>, previous: <><path d="m18 5-9 7 9 7V5ZM6 5v14"/></>,
    fullscreen: <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>, close: <path d="m6 6 12 12M18 6 6 18"/>, trash: <><path d="M4 7h16M9 3h6l1 4H8l1-4ZM7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>, chevron: <path d="m9 18 6-6-6-6"/>, restart: <><path d="M4 8V3m0 0h5M4 3l4 4"/><path d="M5 14a8 8 0 1 0 1-7"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
