"use client";

import { useEffect, useState } from "react";
import { Play, X, Video as VideoIcon } from "lucide-react";
import { fetchVideoTestimonials } from "@/lib/videoTestimonialService";
import type { VideoTestimonial } from "@/types";

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function VideoTestimonials() {
  const [videos, setVideos] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoTestimonial | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const remote = await fetchVideoTestimonials();
        if (isMounted) {
          setVideos(remote || []);
        }
      } catch (err) {
        console.warn("[VideoTestimonials] Notice fetching from database:", err);
        if (isMounted) setVideos([]);
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
    <section id="video-testimonials" style={{ padding: "80px 0" }}>
      <div className="wrap">
        <div className="head">
          <span className="tag">Real Recovery Journeys</span>
          <h2>Patient Video Testimonials</h2>
          <p>
            Listen to verified patients share their personal healing milestones with Panchakarma, chronic joint care, and natural remedies at Charak Ayurveda.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-light)" }}>
            <p>Loading video stories...</p>
          </div>
        ) : videos.length === 0 ? (
          /* Clean Professional Empty State per Requirement 9 & 18 */
          <div
            style={{
              textAlign: "center",
              padding: "70px 24px",
              background: "var(--cream-card)",
              borderRadius: "24px",
              border: "1px dashed var(--border)",
              maxWidth: "680px",
              margin: "20px auto",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(24, 66, 50, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "var(--green)",
              }}
            >
              <VideoIcon size={28} />
            </div>
            <h3 style={{ fontSize: "1.4rem", color: "var(--green)", marginBottom: "8px" }}>
              No video testimonials yet.
            </h3>
            <p style={{ color: "var(--ink-light)", fontSize: "0.98rem", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6 }}>
              Recorded patient video reviews and clinical case accounts will be published here once available.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "32px",
            }}
          >
            {videos.map((vid) => (
              <div
                key={vid.id}
                style={{
                  background: "var(--cream-card)",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                {/* Video Poster Thumbnail & Play Trigger */}
                <div
                  onClick={() => setActiveVideo(vid)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Play video: ${vid.title}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setActiveVideo(vid);
                  }}
                  style={{
                    position: "relative",
                    aspectRatio: "16 / 9",
                    background: "#000000",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  {vid.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 0.9,
                        transition: "transform 0.4s ease",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#78716c",
                      }}
                    >
                      <VideoIcon size={44} />
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.25)",
                    }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.92)",
                        color: "var(--green, #184232)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <Play size={24} style={{ fill: "currentColor", marginLeft: "2px" }} />
                    </div>
                  </div>

                  {vid.duration && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        background: "rgba(0, 0, 0, 0.75)",
                        color: "#ffffff",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {formatDuration(vid.duration)}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div style={{ padding: "24px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--gold-hover, #9c6e28)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "6px",
                      }}
                    >
                      {vid.patientName}
                    </span>
                    <h3 style={{ fontSize: "1.2rem", color: "var(--green)", marginBottom: "8px", lineHeight: 1.35 }}>
                      {vid.title}
                    </h3>
                    {vid.description && (
                      <p style={{ color: "var(--ink-light)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>
                        {vid.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Player Modal (No Autoplay unless user clicks play) */}
        {activeVideo && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveVideo(null);
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "#1c1917",
                borderRadius: "20px",
                maxWidth: "840px",
                width: "100%",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  zIndex: 10,
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Close video player"
              >
                <X size={20} />
              </button>

              <div style={{ aspectRatio: "16 / 9", width: "100%", background: "#000000" }}>
                <video
                  src={activeVideo.videoUrl}
                  poster={activeVideo.thumbnailUrl}
                  controls
                  playsInline
                  preload="metadata"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>

              <div style={{ padding: "20px 24px", color: "#ffffff" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--gold)", fontWeight: 600 }}>
                  {activeVideo.patientName}
                </span>
                <h3 style={{ fontSize: "1.3rem", marginTop: "4px", marginBottom: "6px" }}>
                  {activeVideo.title}
                </h3>
                {activeVideo.description && (
                  <p style={{ color: "#d6d3d1", fontSize: "0.92rem", margin: 0, lineHeight: 1.5 }}>
                    {activeVideo.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
