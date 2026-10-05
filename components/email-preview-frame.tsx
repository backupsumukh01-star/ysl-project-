"use client";

import { useEffect, useRef } from "react";

export function MailFrame({ html, title }: { html: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const fit = () => {
      const body = frame.contentDocument?.body;
      if (!body) return;
      frame.style.height = "0px";
      frame.style.height = `${body.scrollHeight + 4}px`;
    };
    frame.addEventListener("load", fit);
    const timer = window.setTimeout(fit, 60);
    return () => {
      frame.removeEventListener("load", fit);
      window.clearTimeout(timer);
    };
  }, [html]);

  return <iframe ref={ref} title={title} srcDoc={html} className="mail-preview__frame" />;
}
