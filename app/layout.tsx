import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader, Scheherazade_New } from "next/font/google";
import { ProgressProvider } from "@/components/providers/progress-provider";
import { OfflineNotice } from "@/components/pwa/offline-notice";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { assertValidContent } from "@/lib/content/validate";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { THEME_COLORS, themeInitScript } from "@/lib/theme";
import "./globals.css";

// Fails the build (and server start) if bundled religious content is malformed.
assertValidContent();

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
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
        <OfflineNotice />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
