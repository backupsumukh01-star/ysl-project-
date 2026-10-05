"use client";

import { useEffect, useRef, useState } from "react";
import { demoVideos, type DemoVideo } from "@/lib/videos";
import { trackCustom } from "@/lib/analytics/meta";

const playedVideos = new Set<string>();

export function DemoVideoSection({
  videos = demoVideos,
  id = "watch",
}: {
  videos?: DemoVideo[];
  id?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollTo(index: number) {
    const next = (index + videos.length) % videos.length;
    const card = rail.current?.children[next] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setActive(next);
  }

  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    const onScroll = () => {
      const cards = [...node.children] as HTMLElement[];
      const left = node.scrollLeft;
      let nearest = 0;
      let distance = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const delta = Math.abs(card.offsetLeft - left);
        if (delta < distance) {
          distance = delta;
          nearest = index;
        }
      });
      setActive(nearest);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [videos.length]);

  return (
    <section className="section" id={id}>
      <div className="frame">
        <p className="kicker">See it in action</p>
        <h2 className="title">See how the experience comes to life</h2>
        <p className="lede">Watch the Rouge Sur Mesure experience in motion.</p>
        <div className="video-head">
          <button type="button" className="icon-btn" aria-label="Previous video" onClick={() => scrollTo(active - 1)}>
            ←
          </button>
          <button type="button" className="icon-btn" aria-label="Next video" onClick={() => scrollTo(active + 1)}>
            →
          </button>
        </div>
        <div className="video-rail" ref={rail}>
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} active={index === active} />
          ))}
        </div>
        <div className="dots" role="tablist" aria-label="Demo videos">
          {videos.map((video, index) => (
            <button
              key={video.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={video.title}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoCard({ video, active }: { video: DemoVideo; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(!video.src);
  const [muted, setMuted] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) node.pause();
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  async function play() {
    const node = ref.current;
    if (!node || !video.src) {
      setFailed(true);
      setNote("This film is not available yet.");
      return;
    }
    try {
      if (!node.src) node.src = video.src;
      await node.play();
      setPlaying(true);
      setFailed(false);
      setNote("");
      if (!playedVideos.has(video.id)) {
        playedVideos.add(video.id);
        trackCustom("DemoVideoPlayed");
      }
    } catch {
      setFailed(true);
      setNote("This film is not available yet.");
    }
  }

  function toggleMute() {
    const node = ref.current;
    if (!node) return;
    node.muted = !node.muted;
    setMuted(node.muted);
  }

  async function fullscreen() {
    const node = ref.current;
    if (!node) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await node.requestFullscreen?.();
  }

  return (
    <article className={`video-card ${active ? "is-active" : ""}`}>
      <div className="video-frame">
        <video
          ref={ref}
          poster={video.poster}
          playsInline
          preload="none"
          muted={muted}
          controls={playing}
          aria-label={video.title}
          onError={() => {
            setFailed(true);
            setPlaying(false);
            setNote("This film is not available yet.");
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {!playing ? (
          <button type="button" className="play" onClick={play}>
            <span aria-hidden="true">▶</span>
            Watch demo
          </button>
        ) : null}
      </div>
      <div className="video-meta">
        <h3>{video.title}</h3>
        <p>{video.description}</p>
        <div className="video-tools">
          <button type="button" onClick={toggleMute} disabled={!playing && failed}>
            {muted ? "Unmute" : "Mute"}
          </button>
          <button type="button" onClick={fullscreen} disabled={!playing}>
            Full screen
          </button>
        </div>
        <p className="visually-hidden" aria-live="polite">
          {note}
        </p>
        {failed && note ? <p className="muted video-note">{note}</p> : null}
      </div>
    </article>
  );
}
