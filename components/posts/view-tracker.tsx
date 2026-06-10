"use client";

import { useEffect, useRef } from "react";
import { trackPostView } from "@/lib/actions/views";

/** Fire-and-forget view counter, runs once per mount in the browser. */
export function ViewTracker({ postId }: { postId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackPostView(postId).catch(() => undefined);
  }, [postId]);

  return null;
}
