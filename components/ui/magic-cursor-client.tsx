"use client";

import dynamic from "next/dynamic";

const MagicCursor = dynamic(
  () => import("@/components/ui/magic-cursor").then((m) => ({ default: m.MagicCursor })),
  { ssr: false }
);

export default function MagicCursorClient() {
  return <MagicCursor />;
}
