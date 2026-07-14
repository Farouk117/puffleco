import type { MetadataRoute } from "next";

const siteUrl = "https://www.thepufflette.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/menu`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/toppings`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/order`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/track-order`, lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}
