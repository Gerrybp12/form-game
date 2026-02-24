"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // buat reload / refresh
};

export default function CreateFormModal({ open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  async function createForm() {
    if (!title.trim()) {
      setError("Title wajib diisi.");
      return;
    }

    try {
      setCreating(true);
      await api.post("/api/forms", {
        title,
        description: desc || undefined,
      });

      setTitle("");
      setDesc("");
      setError(null);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal create form");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 99999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 92vw)",
          borderRadius: 14,
          border: "3px solid rgba(78, 52, 28, 0.95)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.6)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(250,239,210,0.98), rgba(233,214,170,0.98))",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background:
              "linear-gradient(180deg, rgba(120, 72, 32, 0.95), rgba(85, 48, 20, 0.95))",
            color: "rgba(255,255,255,0.95)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>
            New Form
          </div>
          <button
            onClick={onClose}
            style={{
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(0,0,0,0.2)",
              color: "white",
              borderRadius: 10,
              padding: "6px 10px",
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body Section */}
        <div style={{ padding: 16, color: "rgba(40, 24, 10, 0.95)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
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
              }}
            />

            <textarea
              placeholder="Description (optional)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              rows={4}
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
                resize: "vertical",
              }}
            />

            {error && (
              <div style={{ color: "rgba(220, 38, 38, 0.95)", fontSize: 14, fontWeight: 600 }}>
                {error}
              </div>
            )}
          </div>

          {/* Separator Line */}
          <div
            style={{
              height: 1,
              background: "rgba(120,72,32,0.35)",
              margin: "16px 0",
            }}
          />

          {/* Footer / Buttons Section */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              disabled={creating}
              style={{
                cursor: creating ? "not-allowed" : "pointer",
                borderRadius: 12,
                padding: "10px 14px",
                border: "2px solid rgba(78,52,28,0.55)",
                background: "rgba(255,255,255,0.35)",
                color: "rgba(60,36,14,0.95)",
                fontWeight: 800,
                opacity: creating ? 0.7 : 1,
              }}
            >
              Cancel
            </button>

            <button
              onClick={createForm}
              disabled={creating}
              style={{
                cursor: creating ? "not-allowed" : "pointer",
                borderRadius: 12,
                padding: "10px 14px",
                border: "2px solid rgba(60,35,12,0.95)",
                background:
                  "linear-gradient(180deg, rgba(214,159,64,0.98), rgba(162,108,34,0.98))",
                color: "rgba(255,255,255,0.95)",
                fontWeight: 900,
                letterSpacing: 0.3,
                opacity: creating ? 0.8 : 1,
              }}
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}