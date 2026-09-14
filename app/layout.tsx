import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Know His Names",
  description: "Learn and remember the 99 Names of Allah.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
