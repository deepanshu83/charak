/**
 * YouTube Utility functions for extracting video ID, building embed URL, and thumbnail.
 */

export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
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
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&rel=0`;
}

export function getYouTubeThumbnailUrl(urlOrId: string): string {
  const id = extractYouTubeId(urlOrId);
  if (!id) return "/images/g5.jpg";
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
