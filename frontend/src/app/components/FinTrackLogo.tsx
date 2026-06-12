"use client";

import React from "react";

interface LogoProps {
  variant?: "monogram" | "horizontal" | "icon-light" | "icon-dark";
  size?: number;
  className?: string;
  theme?: "light" | "dark";
}

export default function FinTrackLogo({
  variant = "monogram",
  size = 40,
  className = "",
  theme = "light",
}: LogoProps) {
  switch (variant) {
    case "horizontal":
      return (
        <img
          src="/logo_horizontal.png"
          alt="FinTrack AI"
          style={{ height: size }}
          className={`object-contain inline-block flex-shrink-0 ${className}`}
        />
      );

    case "icon-light":
    case "icon-dark":
    case "monogram":
    default:
      return (
        <img
          src="/logo_monogram.png"
          alt="FinTrack AI"
          style={{ width: size, height: size }}
          className={`object-contain rounded-[24%] inline-block flex-shrink-0 ${className}`}
        />
      );
  }
}
