// src/lib/wordpress.ts
const WP_URL = "https://kthulu.arvipirineos.es/wp-json/wp/v2";

const headers = { "Accept": "application/json" };

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
      media_details: {
        sizes: {
          medium?: { source_url: string };
          large?: { source_url: string };
          full?: { source_url: string };
        };
      };
    }>;
  };
}

export async function getPosts(perPage = 12): Promise<WPPost[]> {
  const url = `${WP_URL}/posts?per_page=${perPage}&_embed`;
  console.log("[WP] Fetching:", url);
  try {
    const res = await fetch(url, { headers });
    console.log("[WP] Status:", res.status);
    if (!res.ok) return [];
    const posts = await res.json();
    console.log("[WP] Posts found:", posts.length);
    return posts;
  } catch (err) {
    console.log("[WP] ERROR:", err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const res = await fetch(`${WP_URL}/posts?slug=${slug}&_embed`, { headers });
    if (!res.ok) return null;
    const posts = await res.json();
    return posts.length > 0 ? posts[0] : null;
  } catch { return null; }
}

export function getFeaturedImage(post: WPPost, size: "medium" | "large" | "full" = "large"): string | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;
  return media.media_details?.sizes?.[size]?.source_url ?? media.source_url;
}

export function getFeaturedImageAlt(post: WPPost): string {
  return post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ?? post.title.rendered;
}
