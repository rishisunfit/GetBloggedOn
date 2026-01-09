import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bloggish",
  description: "Blogging Made Better",
  icons: {
    icon: [
      { url: "/Bloggish_Logo.png" },
      { url: "/Bloggish_Logo.png", sizes: "32x32", type: "image/png" },
      { url: "/Bloggish_Logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/Bloggish_Logo.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/Bloggish_Logo.png",
      },
    ],
  },
};
