import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OrienX — Education & Career Guidance Platform Cambodia",
    short_name: "OrienX",
    description:
      "Cambodia's modern guidance ecosystem pairing Holland RIASEC & MBTI assessments with verified university tuition fees, BacII cutoffs, and 100% scholarships.",
    start_url: "/",
    display: "standalone",
    background_color: "#080D2B",
    theme_color: "#101965",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/images/orienx-mark.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/orienx-mark-dark.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
