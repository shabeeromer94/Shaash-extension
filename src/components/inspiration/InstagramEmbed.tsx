"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

/**
 * Renders an Instagram Reel/post inline using Instagram's own official embed
 * widget (the same markup their "Embed" share option gives you) — visitors
 * watch it right here instead of bouncing to Instagram. `url` is the full
 * Reel/post URL as copied from Instagram, e.g.
 * https://www.instagram.com/reel/XXXXXXXXXXX/.
 */
export function InstagramEmbed({ url }: { url: string }) {
  // Instagram's embed.js only auto-hydrates blockquotes present when it
  // first loads — a client-side navigation to a different Reel (Next.js
  // swapping this component's `url` without a full page reload) needs an
  // explicit re-process call, so this fires on every mount/url change too.
  useEffect(() => {
    window.instgrm?.Embeds?.process();
  }, [url]);

  return (
    <div className="mx-auto flex justify-center overflow-hidden rounded-3xl bg-beige/40">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ width: "100%", maxWidth: "540px", minWidth: "326px" }}
      />
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onLoad={() => window.instgrm?.Embeds?.process()}
      />
    </div>
  );
}
