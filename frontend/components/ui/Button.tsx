"use client";

import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({ variant = "primary", className = "", style, ...props }: Props) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";

  const baseStyle: React.CSSProperties = {
    cursor: props.disabled ? "not-allowed" : "pointer",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 900,
    letterSpacing: 0.3,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: props.disabled ? 0.7 : 1,
    transition: "all 0.2s ease",
    ...style, // allow style overrides
  };

  const variantStyles: React.CSSProperties = isPrimary
    ? {
        border: "2px solid rgba(60,35,12,0.95)",
        background: "linear-gradient(180deg, rgba(214,159,64,0.98), rgba(162,108,34,0.98))",
        color: "rgba(255,255,255,0.95)",
      }
    : isSecondary
    ? {
        border: "2px solid rgba(78,52,28,0.55)",
        background: "rgba(255,255,255,0.35)",
        color: "rgba(60,36,14,0.95)",
      }
    : {
        // danger variant
        border: "2px solid rgba(120, 20, 20, 0.95)",
        background: "linear-gradient(180deg, rgba(200, 60, 60, 0.98), rgba(150, 30, 30, 0.98))",
        color: "rgba(255,255,255,0.95)",
      };

  return (
    <button
      className={className}
      style={{ ...baseStyle, ...variantStyles }}
      {...props}
    />
  );
}