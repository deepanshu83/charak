/**
 * YouTube Utility functions for extracting video ID, building embed URL, and thumbnail.
 * Strictly formatted for 16:9 widescreen and cross-device landscape/portrait compatibility.
 */

export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // If already a clean 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common YouTube URL patterns (standard watch, shorts, live, embed, youtu.be, mobile)
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i,
    /[?&]v=([a-zA-Z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function getYouTubeEmbedUrl(urlOrId: string, autoplay = true): string | null {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  // Playsinline, modestbranding, rel=0, and enablejsapi ensure flawless 16:9 playback on mobile landscape & iOS/Android
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&rel=0&playsinline=1&modestbranding=1&enablejsapi=1`;
}

/**
 * Returns a 16:9 YouTube thumbnail.
 * mqdefault (320x180) is native 16:9 with ZERO letterbox black bars.
 * maxresdefault (1280x720) is HD 16:9.
 */
export function getYouTubeThumbnailUrl(
  urlOrId: string,
  quality: "mq" | "maxres" | "hq" = "mq"
): string {
  const id = extractYouTubeId(urlOrId);
  if (!id) return "/images/g5.jpg";
  if (quality === "maxres") return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  if (quality === "hq") return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}
