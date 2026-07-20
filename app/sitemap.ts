import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export default function sitemap(): MetadataRoute.Sitemap {
  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/problems",
    "/categories",
    "/leaderboard",
    "/login",
    "/register",
    "/forgot-password",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  return staticRoutes;
}
