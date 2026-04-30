
// src/lib/wordpress.ts
const WP_URL = "https://kthulu.arvipirineos.es/wp-json/wp/v2";

const headers = { "Accept": "application/json" };

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WPTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  featured_media: number;
  categories: number[];
  tags: number[];
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
    "wp:term"?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
    }>>;
  };
}

// ── Posts ── 
 
 /* export async function getPosts(perPage = 100): Promise<WPPost[]> {
  const url = `${WP_URL}/posts?per_page=${perPage}&_embed`;
  console.log("[WP] Fetching:", url);
  try {
    const res = await fetch(url, { headers });
    console.log("[WP] Status:", res.status);
    console.log("[WP] Content-Type:", res.headers.get("content-type"));
    if (!res.ok) return [];
    const text = await res.text();
    console.log("[WP] Body start:", text.substring(0, 300));
    try {
      const posts = JSON.parse(text);
      console.log("[WP] Parsed type:", typeof posts, "isArray:", Array.isArray(posts));
      if (Array.isArray(posts)) {
        console.log("[WP] Posts found:", posts.length);
        return posts;
      }
      return [];
    } catch (parseErr) {
      console.log("[WP] JSON parse error:", parseErr);
      return [];
    }
  } catch (err) {
    console.log("[WP] Fetch ERROR:", err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const res = await fetch(`${WP_URL}/posts?slug=${slug}&_embed`, { headers });
    if (!res.ok) return null;
    const text = await res.text();
    try {
      const posts = JSON.parse(text);
      return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
    } catch { return null; }
  } catch { return null; }
}

export async function getPostsByCategory(categoryId: number, perPage = 100): Promise<WPPost[]> {
  try {
    const res = await fetch(`${WP_URL}/posts?categories=${categoryId}&per_page=${perPage}&_embed`, { headers });
    if (!res.ok) return [];
    const text = await res.text();
    try {
      const posts = JSON.parse(text);
      return Array.isArray(posts) ? posts : [];
    } catch { return []; }
  } catch { return []; }
}

export async function getPostsByTag(tagId: number, perPage = 100): Promise<WPPost[]> {
  try {
    const res = await fetch(`${WP_URL}/posts?tags=${tagId}&per_page=${perPage}&_embed`, { headers });
    if (!res.ok) return [];
    const text = await res.text();
    try {
      const posts = JSON.parse(text);
      return Array.isArray(posts) ? posts : [];
    } catch { return []; }
  } catch { return []; }
} 
 */
export async function getPosts(perPage = 100): Promise<WPPost[]> {
  const url = `${WP_URL}/posts?per_page=${perPage}&_embed&status=publish`;

  console.log("[WP] Fetching:", url);

  const res = await fetch(url, {
    headers,
    cache: "no-store",
  });

  console.log("[WP] Status:", res.status);
  console.log("[WP] Content-Type:", res.headers.get("content-type"));

  if (!res.ok) {
    throw new Error(`[WP] Error fetching posts: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  console.log("[WP] Body start:", text.substring(0, 300));

  let posts: unknown;

  try {
    posts = JSON.parse(text);
  } catch (parseErr) {
    throw new Error(`[WP] JSON parse error while fetching posts: ${String(parseErr)}`);
  }

  console.log("[WP] Parsed type:", typeof posts, "isArray:", Array.isArray(posts));

  if (!Array.isArray(posts)) {
    throw new Error("[WP] WordPress did not return an array of posts");
  }

  console.log("[WP] Posts found:", posts.length);

  if (posts.length === 0) {
    throw new Error("[WP] WordPress returned zero posts. Build cancelled to avoid publishing an empty blog index.");
  }

  return posts as WPPost[];
}
// ── Categorías y etiquetas ──

export async function getCategories(): Promise<WPCategory[]> {
  try {
    const res = await fetch(`${WP_URL}/categories?per_page=100&hide_empty=true`, { headers });
    if (!res.ok) return [];
    const text = await res.text();
    try {
      const cats = JSON.parse(text);
      return Array.isArray(cats) ? cats : [];
    } catch { return []; }
  } catch { return []; }
}

export async function getTags(): Promise<WPTag[]> {
  try {
    const res = await fetch(`${WP_URL}/tags?per_page=100&hide_empty=true`, { headers });
    if (!res.ok) return [];
    const text = await res.text();
    try {
      const tags = JSON.parse(text);
      return Array.isArray(tags) ? tags : [];
    } catch { return []; }
  } catch { return []; }
}

// ── Imágenes ──

export function getFeaturedImage(post: WPPost, size: "medium" | "large" | "full" = "large"): string | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;
  return media.media_details?.sizes?.[size]?.source_url ?? media.source_url;
}

export function getFeaturedImageAlt(post: WPPost): string {
  return post._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ?? post.title.rendered;
}

// ── Helpers ──

export function getPostCategories(post: WPPost): Array<{ name: string; slug: string }> {
  const terms = post._embedded?.["wp:term"]?.[0];
  if (!terms) return [];
  return terms.filter(t => t.taxonomy === "category").map(t => ({ name: t.name, slug: t.slug }));
}

export function getPostTags(post: WPPost): Array<{ name: string; slug: string }> {
  const terms = post._embedded?.["wp:term"]?.[1];
  if (!terms) return [];
  return terms.filter(t => t.taxonomy === "post_tag").map(t => ({ name: t.name, slug: t.slug }));
}

export function getAdjacentPosts(posts: WPPost[], currentSlug: string): { prev: WPPost | null; next: WPPost | null } {
  const index = posts.findIndex(p => p.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

export function getRelatedPosts(posts: WPPost[], currentPost: WPPost, limit = 3): WPPost[] {
  const currentCats = currentPost.categories || [];
  const currentTags = currentPost.tags || [];
  return posts
    .filter(p => p.id !== currentPost.id)
    .map(p => {
      let score = 0;
      (p.categories || []).forEach(c => { if (currentCats.includes(c)) score += 2; });
      (p.tags || []).forEach(t => { if (currentTags.includes(t)) score += 1; });
      return { post: p, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.post);
}