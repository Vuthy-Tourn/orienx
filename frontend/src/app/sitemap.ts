import type { MetadataRoute } from "next";
import universitiesData from "@/data/static/universities.json";
import majorsData from "@/data/static/majors.json";
import careersData from "@/data/static/careers.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orienx.edu.kh";
  const now = new Date();

  // Core Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/majors`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/universities`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/universities/compare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/riasec`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/personality`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/bacii`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/scholarships`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic University Pages (All verified institutions in Cambodia)
  const universityUrls: MetadataRoute.Sitemap = (universitiesData as Array<{ slug?: string }>)
    .filter((u) => Boolean(u.slug))
    .map((u) => ({
      url: `${baseUrl}/universities/${u.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  // Dynamic Major Pages
  const majorUrls: MetadataRoute.Sitemap = (majorsData as Array<{ slug?: string }>)
    .filter((m) => Boolean(m.slug))
    .map((m) => ({
      url: `${baseUrl}/majors/${m.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  // Dynamic Career Profiles
  const careerUrls: MetadataRoute.Sitemap = (careersData as Array<{ slug?: string }>)
    .filter((c) => Boolean(c.slug))
    .map((c) => ({
      url: `${baseUrl}/careers/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    }));

  return [...staticPages, ...universityUrls, ...majorUrls, ...careerUrls];
}
