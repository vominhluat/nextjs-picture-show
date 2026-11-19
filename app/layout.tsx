import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina — Trình chiếu ảnh",
  description: "Trình chiếu hình ảnh cục bộ đẹp, nhanh và riêng tư.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className="app-document"
    >
      <body className="root-body">{children}</body>
    </html>
  );
}
