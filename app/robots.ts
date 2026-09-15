import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Required for `output: "export"` (GitHub Pages review builds).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
