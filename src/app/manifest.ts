import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Takween | Professional Training Courses",
    short_name: "Takween",
    description: "Globally accredited professional training courses across cities worldwide.",
    start_url: "/en",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f2557",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}