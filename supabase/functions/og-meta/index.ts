import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SITE_NAME = "WesternProperties";
const SITE_URL = "https://westernproperties.in";
const DEFAULT_IMAGE = "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200";
const DEFAULT_DESCRIPTION = "Find your dream property with WesternProperties. Browse land for sale, rooms for rent, commercial spaces, and leased properties across prime locations in Goa.";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatPrice(price: number | null, period: string | null): string {
  if (!price) return "Price on Request";
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
  if (period && period !== "total") return `${formatted}/${period}`;
  return formatted;
}

function buildOgHtml(opts: {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(opts.title)}</title>
  <meta name="description" content="${esc(opts.description)}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${esc(opts.siteName)}" />
  <meta property="og:title" content="${esc(opts.title)}" />
  <meta property="og:description" content="${esc(opts.description)}" />
  <meta property="og:image" content="${esc(opts.image)}" />
  <meta property="og:image:secure_url" content="${esc(opts.image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:url" content="${esc(opts.url)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@westernprops" />
  <meta name="twitter:title" content="${esc(opts.title)}" />
  <meta name="twitter:description" content="${esc(opts.description)}" />
  <meta name="twitter:image" content="${esc(opts.image)}" />
  <meta name="twitter:image:alt" content="${esc(opts.title)}" />

  <link rel="canonical" href="${esc(opts.url)}" />
  <script>window.location.replace("${esc(opts.url)}");</script>
</head>
<body>
  <p>Redirecting to <a href="${esc(opts.url)}">${esc(opts.title)}</a>...</p>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const propertyId = url.searchParams.get("id");
    const blogSlug = url.searchParams.get("slug");
    const pageUrl = url.searchParams.get("url") || SITE_URL;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    if (blogSlug) {
      const { data: blog } = await supabase
        .from("blogs")
        .select("id, title, excerpt, cover_image, images, youtube_url, seo_title, seo_description, slug")
        .eq("slug", blogSlug)
        .eq("published", true)
        .maybeSingle();

      if (!blog) {
        return new Response("Not found", { status: 404, headers: corsHeaders });
      }

      const images: string[] = Array.isArray(blog.images) ? blog.images : [];
      const coverImage =
        blog.cover_image ||
        images[0] ||
        DEFAULT_IMAGE;

      const title = `${blog.seo_title || blog.title} | ${SITE_NAME}`;
      const description = blog.seo_description || blog.excerpt || DEFAULT_DESCRIPTION;
      const canonicalUrl = `${SITE_URL}/blog/${blog.slug}`;

      const html = buildOgHtml({
        title,
        description,
        image: coverImage,
        url: canonicalUrl,
        siteName: SITE_NAME,
      });

      return new Response(html, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    if (propertyId) {
      const { data: property } = await supabase
        .from("properties")
        .select("id, title, description, cover_image, price, price_period, city, state, type, property_images(url, is_cover, sort_order)")
        .eq("id", propertyId)
        .maybeSingle();

      if (!property) {
        return new Response("Not found", { status: 404, headers: corsHeaders });
      }

      type PropImage = { url: string; is_cover: boolean; sort_order: number };
      const propImages = (property.property_images as PropImage[]) || [];
      const sortedImages = [...propImages].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      const coverImage =
        property.cover_image ||
        sortedImages.find((i) => i.is_cover)?.url ||
        sortedImages[0]?.url ||
        DEFAULT_IMAGE;

      const title = `${property.title} | ${SITE_NAME}`;
      const description =
        property.description ||
        `${formatPrice(property.price, property.price_period)} — ${property.city}, ${property.state}. Contact WesternProperties for details.`;

      const canonicalUrl = `${SITE_URL}/properties/${property.id}`;

      const html = buildOgHtml({
        title,
        description,
        image: coverImage,
        url: canonicalUrl,
        siteName: SITE_NAME,
      });

      return new Response(html, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const html = buildOgHtml({
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      image: DEFAULT_IMAGE,
      url: pageUrl,
      siteName: SITE_NAME,
    });
    return new Response(html, {
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
