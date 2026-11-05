"use client";

import { useEffect, useState } from "react";
import { Play, X, Video as VideoIcon } from "lucide-react";
import type { VideoTestimonial } from "@/types";
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtubeUtils";
import { DEFAULT_VIDEO_TESTIMONIALS } from "@/lib/videoTestimonialService";

export default function VideoTestimonials() {
  const [videos, setVideos] = useState<VideoTestimonial[]>(DEFAULT_VIDEO_TESTIMONIALS);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/video-testimonials");
        const json = await res.json();
        if (isMounted) {
          if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
            setVideos(json.data);
          } else {
            setVideos(DEFAULT_VIDEO_TESTIMONIALS);
          }
        }
      } catch (err) {
        console.warn("[VideoTestimonials] notice loading videos:", err);
        if (isMounted) {
          setVideos(DEFAULT_VIDEO_TESTIMONIALS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Escape key and body scroll lock when video modal is active
  useEffect(() => {
    if (!activeVideo) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeVideo]);

  return (
    <section id="video-testimonials" style={{ padding: "60px 0 80px" }}>
      <div className="wrap">
        <div className="head" style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="tag">Real Recovery Journeys</span>
          <h2 style={{ fontSize: "2.4rem", color: "var(--green)", marginBottom: "12px" }}>
            Patient Video Testimonials
          </h2>
          <p style={{ maxWidth: "600px", margin: "0 auto", color: "var(--ink-light)", fontSize: "1.05rem" }}>
            Watch authentic recovery stories and clinical outcomes directly from patients treated at Charak Ayurveda, Pilani.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-light)" }}>
            <p>Loading patient stories…</p>
          </div>
        ) : videos.length === 0 ? (
          /* Clean Coming Soon State when no videos posted yet */
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              background: "#ffffff",
              borderRadius: "24px",
              border: "1px solid #e7dfd3",
              padding: "48px 24px",
              textAlign: "center",
              boxShadow: "0 8px 28px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(24, 66, 50, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "var(--green)",
              }}
            >
              <VideoIcon size={30} />
            </div>

            <span
              style={{
                display: "inline-block",
                background: "rgba(194, 139, 56, 0.12)",
                color: "var(--gold-dark, #a87932)",
                padding: "4px 14px",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "12px",
              }}
            >
              Coming Soon
            </span>

            <h3 style={{ fontSize: "1.6rem", color: "var(--green)", marginBottom: "10px" }}>
              Patient Video Testimonials
            </h3>

            <p style={{ color: "var(--ink-light)", fontSize: "0.98rem", marginBottom: "0" }}>
              Real patient recovery stories and clinical video reviews are coming soon.
            </p>
          </div>
        ) : (
          /* Video Grid Playing Directly on Website */
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "24px",
              maxWidth: "1140px",
              margin: "0 auto",
            }}
          >
            {videos.map((vid) => {
              const ytid = extractYouTubeId(vid.videoUrl);
              const thumb = vid.thumbnailUrl || (ytid ? getYouTubeThumbnailUrl(ytid, "mq") : "/images/g5.jpg");

              return (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "1px solid #e7dfd3",
                    boxShadow: "0 4px 18px rgba(24, 66, 50, 0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    maxWidth: "340px",
                    flex: "0 1 340px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 28px rgba(24, 66, 50, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 4px 18px rgba(24, 66, 50, 0.05)";
                  }}
                >
                  {/* Thumbnail Container (Strict 16:9 widescreen) */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 9",
                      background: "#0a1f16",
                      overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={vid.title}
                      loading="lazy"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.35s ease",
                      }}
                    />
                    {/* Dark Play Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.15))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "#FF0000",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        <Play size={22} fill="#ffffff" style={{ marginLeft: "2px" }} />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--gold)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Hospital Recovery Story
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "1.06rem",
                        color: "var(--green)",
                        marginBottom: "6px",
                        lineHeight: 1.35,
                      }}
                    >
                      {vid.title}
                    </h3>

                    {vid.description && (
                      <p
                        style={{
                          fontSize: "0.86rem",
                          color: "var(--ink-light)",
                          marginBottom: "12px",
                          lineHeight: 1.45,
                          flexGrow: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {vid.description}
                      </p>
                    )}

                    <div
                      style={{
                        marginTop: "auto",
                        borderTop: "1px solid #f0eae1",
                        paddingTop: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.85rem",
                        color: "var(--ink-light)",
                      }}
                    >
                      <strong style={{ color: "var(--green)" }}>{vid.patientName}</strong>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--gold-dark, #a87932)", fontWeight: 600 }}>
                        <Play size={12} fill="currentColor" /> Watch Story
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Video Player Modal (Plays directly on website, 16:9 + Landscape Optimized) */}
        {activeVideo && (
          <div
            className="video-modal-backdrop"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(7, 18, 14, 0.94)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              overflow: "hidden",
            }}
            onClick={() => setActiveVideo(null)}
            role="dialog"
            aria-modal="true"
            aria-label={activeVideo.title}
          >
            <div
              className="video-modal-dialog"
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "min(880px, calc((92vh - 85px) * (16 / 9)))",
                maxHeight: "92vh",
                background: "#071711",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 24px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(194,139,56,0.3)",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                aria-label="Close video player"
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(0, 0, 0, 0.75)",
                  backdropFilter: "blur(4px)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.35)",
                  borderRadius: "50%",
                  width: "38px",
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 30,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--gold)";
                  e.currentTarget.style.color = "#000000";
                  e.currentTarget.style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.75)";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>

              {/* YouTube Embedded iframe Player (Strict 16:9 Aspect Ratio) */}
              <div
                className="video-player-frame"
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  background: "#000000",
                  overflow: "hidden",
                  maxHeight: "calc(92vh - 85px)",
                }}
              >
                <iframe
                  src={getYouTubeEmbedUrl(activeVideo.videoUrl, true) || ""}
                  title={activeVideo.title}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Video Info Footer */}
              <div
                className="video-modal-info"
                style={{
                  padding: "14px 20px",
                  background: "#0d261b",
                  borderTop: "1px solid rgba(194, 139, 56, 0.2)",
                  color: "#ffffff",
                }}
              >
                <h4
                  style={{
                    fontSize: "1.12rem",
                    color: "var(--cream, #f7f3ea)",
                    marginBottom: "3px",
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {activeVideo.title}
                </h4>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.82)",
                    margin: 0,
                    lineHeight: 1.35,
                  }}
                >
                  <strong style={{ color: "var(--gold)" }}>{activeVideo.patientName}</strong>
                  {activeVideo.description ? ` • ${activeVideo.description}` : ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
