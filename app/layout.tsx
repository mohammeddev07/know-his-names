import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader, Scheherazade_New } from "next/font/google";
import { ProgressProvider } from "@/components/providers/progress-provider";
import { THEME_COLORS, themeInitScript } from "@/lib/theme";
import "./globals.css";

const sans = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-ui",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

const arabic = Scheherazade_New({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-scheherazade",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Know His Names",
    template: "%s — Know His Names",
  },
  description: "Learn and remember the 99 Names of Allah.",
  applicationName: "Know His Names",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${sans.variable} ${serif.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ProgressProvider>{children}</ProgressProvider>
      </body>
    </html>
  );
}
