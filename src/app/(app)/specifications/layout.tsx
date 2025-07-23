// src/app/specifications/layout.tsx
"use client";
import React from "react";
import dynamic from "next/dynamic";


export default function SpecificationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
    </div>
  );
}
