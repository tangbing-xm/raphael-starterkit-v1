"use client";
import dynamic from "next/dynamic";

// StagewiseToolbar 仅在客户端渲染，避免 SSR 问题
const StagewiseToolbar = dynamic(
  () => import("@stagewise/toolbar-next").then(mod => mod.StagewiseToolbar),
  { ssr: false }
);

// ReactPlugin 直接 import default
import ReactPlugin from "@stagewise-plugins/react";

export default function StagewiseToolbarWrapper() {
  return <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />;
}
