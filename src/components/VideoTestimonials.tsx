"use client";

import { useEffect, useState } from "react";
import { Play, X, Video as VideoIcon, Sparkles } from "lucide-react";
import type { VideoTestimonial } from "@/types";
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/youtubeUtils";

export default function VideoTestimonials() {
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/video-testimonials");
        const json = await res.json();
        if (isMounted && json.ok && Array.isArray(json.data)) {
          setVideos(json.data);
        }
      } catch (err) {
        console.warn("[VideoTestimonials] notice loading videos:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

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
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "28px",
            }}
          >
            {videos.map((vid) => {
              const ytid = extractYouTubeId(vid.videoUrl);
              const thumb = vid.thumbnailUrl || (ytid ? `https://img.youtube.com/vi/${ytid}/hqdefault.jpg` : "/images/g5.jpg");

              return (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "1px solid #e7dfd3",
                    boxShadow: "0 8px 24px rgba(24, 66, 50, 0.04)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 14px 32px rgba(24, 66, 50, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(24, 66, 50, 0.04)";
                  }}
                >
                  {/* Thumbnail Container */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingTop: "56.25%",
                      background: "#000000",
                      overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={vid.title}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
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
                        background: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          background: "#FF0000",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                        }}
                      >
                        <Play size={26} fill="#ffffff" style={{ marginLeft: "3px" }} />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ marginBottom: "6px" }}>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--gold)",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Clinical Recovery Story
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: "1.18rem",
                        color: "var(--green)",
                        marginBottom: "8px",
                        lineHeight: 1.4,
                      }}
                    >
                      {vid.title}
                    </h3>

                    {vid.description && (
                      <p
                        style={{
                          fontSize: "0.92rem",
                          color: "var(--ink-light)",
                          marginBottom: "16px",
                          lineHeight: 1.5,
                          flexGrow: 1,
                        }}
                      >
                        {vid.description}
                      </p>
                    )}

                    <div
                      style={{
                        marginTop: "auto",
                        borderTop: "1px solid #f0eae1",
                        paddingTop: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.88rem",
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

        {/* Video Player Modal (Plays directly on website, zero redirection!) */}
        {activeVideo && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.88)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setActiveVideo(null)}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "860px",
                background: "#000000",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 16px 50px rgba(0,0,0,0.7)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveVideo(null)}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: "rgba(255,255,255,0.25)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.45)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
              >
                <X size={22} />
              </button>

              {/* YouTube Embedded iframe Player */}
              <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
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
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info Footer */}
              <div style={{ padding: "20px 24px", background: "var(--deep)", color: "#ffffff" }}>
                <h4 style={{ fontSize: "1.25rem", color: "var(--cream)", marginBottom: "6px" }}>
                  {activeVideo.title}
                </h4>
                <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                  Patient: <strong>{activeVideo.patientName}</strong> {activeVideo.description ? `• ${activeVideo.description}` : ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
