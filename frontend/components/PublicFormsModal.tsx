"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicPinFormModal from "./PublicPinFormModal";

type PublicFormItem = {
  id: string;
  title: string;
  description?: string | null;
  pin: string;
  updatedAt: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PublicFormsModal({ open, onClose }: Props) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [items, setItems] = useState<PublicFormItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePin, setActivePin] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          setError(null);
          setLoading(true);
          const res = await api.get("/api/public/forms");
          setItems(res.data.data);
        } catch (e: any) {
          setError(e?.response?.data?.message ?? "Gagal membuka arsip publik");
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // Reset state saat ditutup
      setPin("");
      setError(null);
    }
  }, [open]);

  function enterPin() {
    const p = pin.trim();
    if (!/^\d{6}$/.test(p)) {
      setError("Segel harus berupa 6 angka rahasia.");
      return;
    }
    // Ganti router.push menjadi ini:
    setActivePin(p);
  }

  if (!open) return null;

  if (activePin) {
    return (
      <PublicPinFormModal
        open={true}
        pin={activePin}
        onClose={() => setActivePin(null)} // Saat ditutup, kembali ke daftar form publik
      />
    );
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
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
          width: "min(640px, 95vw)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
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
            padding: "16px 20px",
            background:
              "linear-gradient(180deg, rgba(120, 72, 32, 0.95), rgba(85, 48, 20, 0.95))",
            color: "rgba(255,255,255,0.95)",
            borderBottom: "2px solid rgba(60,35,12,0.95)",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>
              Balai Arsip Publik
            </div>
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

        {/* Scrollable Body Section */}
        <div
          style={{
            padding: 24,
            overflowY: "auto",
            flex: 1,
            color: "rgba(40, 24, 10, 0.95)",
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 8,
                background: "rgba(220, 38, 38, 0.1)",
                border: "1px solid rgba(220, 38, 38, 0.3)",
                color: "rgba(220, 38, 38, 0.95)",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          )}

          {/* Section: Masukkan PIN */}
          <div
            style={{
              background: "rgba(255,255,255,0.4)",
              border: "2px solid rgba(78,52,28,0.4)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 800,
                margin: "0 0 4px 0",
                color: "rgba(60,36,14,0.95)",
              }}
            >
              Gulungan Tertutup
            </h2>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
                margin: "0 0 16px 0",
                lineHeight: 1.4,
              }}
            >
              Masukkan 6 angka segel rahasia (PIN) jika kamu diundang untuk
              mengisi sebuah gulungan khusus.
            </p>

            <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Contoh: 123456"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  style={{ height: "100%" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") enterPin();
                  }}
                />
              </div>
              <Button onClick={enterPin} variant="primary">
                Buka Segel
              </Button>
            </div>
          </div>

          {/* Separator */}
          <div
            style={{
              height: 1,
              background: "rgba(120,72,32,0.35)",
              margin: "24px 0",
            }}
          />

          {/* Section: Discover / Public Forms */}
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: "0 0 16px 0",
                color: "rgba(60,36,14,0.95)",
              }}
            >
              Temukan Gulungan Publik
            </h2>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px 0",
                  fontWeight: 700,
                  opacity: 0.7,
                }}
              >
                Mencari arsip...
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px 0",
                  fontSize: 14,
                  opacity: 0.7,
                  fontStyle: "italic",
                }}
              >
                Belum ada gulungan publik yang dibagikan di balai ini.
              </div>
            ) : (
              <ul
                style={{
                  padding: 0,
                  margin: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {items.map((f) => (
                  <li
                    key={f.id}
                    style={{
                      background: "rgba(255,255,255,0.35)",
                      border: "2px solid rgba(78,52,28,0.25)",
                      borderRadius: 12,
                      padding: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "rgba(40,24,10,0.95)",
                        }}
                      >
                        {f.title}
                      </div>
                      {f.description && (
                        <div
                          style={{
                            fontSize: 13,
                            marginTop: 4,
                            opacity: 0.8,
                            lineHeight: 1.4,
                          }}
                        >
                          {f.description}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          marginTop: 8,
                          opacity: 0.6,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            background: "rgba(120,72,32,0.15)",
                            borderRadius: 12,
                            border: "1px solid rgba(120,72,32,0.2)",
                          }}
                        >
                          Segel Publik: {f.pin}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={() => setActivePin(f.pin)} // Swap langsung!
                      style={{ padding: "8px 16px" }}
                    >
                      Baca
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
