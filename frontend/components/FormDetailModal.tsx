"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

type Props = {
  open: boolean;
  formId: string | null;
  onClose: () => void;
  onEdit: (id: string) => void; // Fungsi untuk berpindah ke mode edit
  onRespons: (id: string) => void;
};

export default function FormDetailModal({
  open,
  formId,
  onClose,
  onEdit,
  onRespons,
}: Props) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && formId) {
      (async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await api.get(`/api/forms/${formId}`);
          setData(res.data.data);
        } catch (e: any) {
          setError(e?.response?.data?.message ?? "Gagal membuka gulungan form");
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // Reset data jika ditutup
      setData(null);
    }
  }, [open, formId]);

  if (!open || !formId) return null;

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
          width: "min(720px, 95vw)",
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
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>
            Detail Gulungan
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
          {error ? (
            <div
              style={{
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
          ) : loading || !data ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                fontWeight: 700,
                opacity: 0.7,
              }}
            >
              Membaca isi gulungan...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Info Utama */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      margin: "0 0 8px 0",
                      color: "rgba(60,36,14,0.95)",
                    }}
                  >
                    {data.title}
                  </h1>
                  {data.description && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        opacity: 0.85,
                        lineHeight: 1.5,
                      }}
                    >
                      {data.description}
                    </p>
                  )}
                  <div style={{ marginTop: 12 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        padding: "4px 10px",
                        borderRadius: 20,
                        background:
                          data.status === "PUBLISHED"
                            ? "rgba(34, 139, 34, 0.2)"
                            : "rgba(120, 72, 32, 0.15)",
                        color:
                          data.status === "PUBLISHED"
                            ? "#006400"
                            : "rgba(120, 72, 32, 0.95)",
                        border: `1px solid ${data.status === "PUBLISHED" ? "rgba(34, 139, 34, 0.4)" : "rgba(120, 72, 32, 0.3)"}`,
                      }}
                    >
                      Status: {data.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="primary"
                    onClick={() => onEdit(data.id)} // Memicu swap ke layar Edit
                  >
                    Pahat Pertanyaan
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onRespons(data.id)}
                  >
                    Responses
                  </Button>
                </div>
              </div>

              {/* Garis Pemisah */}
              <div style={{ height: 1, background: "rgba(120,72,32,0.35)" }} />

              {/* Daftar Pertanyaan */}
              <div>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    margin: "0 0 16px 0",
                    color: "rgba(60,36,14,0.95)",
                  }}
                >
                  Isi Pertanyaan
                </h2>

                {data.questions?.length ? (
                  <ol
                    style={{
                      padding: 0,
                      margin: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {data.questions.map((q: any) => (
                      <li
                        key={q.id}
                        style={{
                          background: "rgba(255,255,255,0.25)",
                          border: "2px solid rgba(78,52,28,0.2)",
                          borderRadius: 12,
                          padding: "12px 16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "rgba(40,24,10,0.95)",
                          }}
                        >
                          {q.order}. {q.title}{" "}
                          {q.isRequired && (
                            <span
                              style={{
                                fontSize: 12,
                                color: "rgba(200,50,50,0.95)",
                                marginLeft: 4,
                              }}
                            >
                              (Wajib)
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 8px",
                            borderRadius: 16,
                            background: "rgba(120, 72, 32, 0.1)",
                            color: "rgba(120, 72, 32, 0.95)",
                            border: "1px solid rgba(120, 72, 32, 0.2)",
                          }}
                        >
                          {q.type.replace("_", " ")}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p
                    style={{
                      fontSize: 14,
                      opacity: 0.7,
                      fontStyle: "italic",
                      margin: 0,
                    }}
                  >
                    Gulungan ini belum memiliki pertanyaan untuk dijawab.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
