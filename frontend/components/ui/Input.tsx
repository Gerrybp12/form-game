"use client";

import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, className = "", style, ...props }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 14, fontWeight: 800, color: "rgba(40, 24, 10, 0.95)" }}>
          {label}
        </label>
      )}
      <input
        className={className}
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: "2px solid rgba(78,52,28,0.5)",
          background: "rgba(255,255,255,0.4)",
          color: "rgba(40, 24, 10, 0.95)",
          fontSize: 14,
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          ...style,
        }}
        {...props}
      />
      {error && (
        <p style={{ color: "rgba(220, 38, 38, 0.95)", fontSize: 13, fontWeight: 700, margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}