"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FormListItem } from "@/lib/types";
import { useRequireAuth } from "@/lib/requireAuth";
import Button from "@/components/ui/Button";
import EditFormModal from "./EditFormModal";
import FormDetailModal from "./FormDetailModal";
import ResponsesModal from "./ResponsesModal";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ManageFormsModal({ open, onClose }: Props) {
  useRequireAuth();

  const [items, setItems] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editFormId, setEditFormId] = useState<string | null>(null);
  const [detailFormId, setDetailFormId] = useState<string | null>(null);
  const [responsesFormId, setResponsesFormId] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setLoading(true);
      const res = await api.get("/api/forms");
      setItems(res.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal memuat gulungan form");
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(id: string, nextStatus: "DRAFT" | "PUBLISHED") {
    try {
      setError(null);
      await api.patch(`/api/forms/${id}`, { status: nextStatus });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal memperbarui status");
    }
  }

  async function deleteForm(id: string) {
    if (!confirm("Apakah kamu yakin ingin membakar gulungan form ini?")) return;
    try {
      await api.delete(`/api/forms/${id}`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal menghapus form");
    }
  }

  async function togglePrivate(id: string, next: boolean) {
    try {
      setError(null);
      await api.patch(`/api/forms/${id}`, { isPrivate: next });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal update privacy");
    }
  }

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open]);

  if (!open) return null;

  if (editFormId) {
    return (
      <EditFormModal
        open={true}
        formId={editFormId}
        onClose={() => {
          setEditFormId(null);
          load();
        }}
      />
    );
  }
  if (responsesFormId) {
    return (
      <ResponsesModal 
  open={!!responsesFormId} 
  formId={responsesFormId} 
  onClose={() => setResponsesFormId(null)} 
/>
    );
  }

  if (detailFormId) {
    return (
      <FormDetailModal
        open={true}
        formId={detailFormId}
        onClose={() => setDetailFormId(null)} 
        onEdit={(id) => {
          setDetailFormId(null); 
          setEditFormId(id); 
        }}
        onRespons={(id) => {
          setDetailFormId(null);
          setResponsesFormId(id); 
        }}
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
          width: "min(760px, 95vw)", 
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
              Koleksi Gulungan
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
              Kelola dan periksa semua form milikmu.
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
            padding: 20,
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

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                fontWeight: 700,
                opacity: 0.7,
              }}
            >
              Membuka arsip...
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                fontWeight: 700,
                opacity: 0.7,
              }}
            >
              Belum ada gulungan yang diciptakan.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    background: "rgba(255,255,255,0.35)",
                    border: "2px solid rgba(78,52,28,0.25)",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "rgba(60,36,14,0.95)",
                            textDecoration: "none",
                          }}
                        >
                          {f.title}
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: "4px 8px",
                            borderRadius: 20,
                            background:
                              f.status === "PUBLISHED"
                                ? "rgba(34, 139, 34, 0.2)"
                                : "rgba(120, 72, 32, 0.15)",
                            color:
                              f.status === "PUBLISHED"
                                ? "#006400"
                                : "rgba(120, 72, 32, 0.95)",
                            border: `1px solid ${f.status === "PUBLISHED" ? "rgba(34, 139, 34, 0.4)" : "rgba(120, 72, 32, 0.3)"}`,
                          }}
                        >
                          {f.status}
                        </span>
                        <p className="mt-1 text-xs text-gray-500">
                          PIN: {f.pin} {f.isPrivate ? "• Private" : ""}
                        </p>
                      </div>

                      {f.description && (
                        <p
                          style={{
                            marginTop: 6,
                            marginBottom: 0,
                            fontSize: 13,
                            opacity: 0.85,
                            lineHeight: 1.4,
                          }}
                        >
                          {f.description}
                        </p>
                      )}

                      {f._count && (
                        <p
                          style={{
                            marginTop: 8,
                            marginBottom: 0,
                            fontSize: 12,
                            fontWeight: 700,
                            opacity: 0.6,
                          }}
                        >
                          {f._count.questions} pertanyaan •{" "}
                          {f._count.submissions} respon
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <Button
                      onClick={() => setDetailFormId(f.id)}
                      variant="secondary"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                    >
                      Detail
                    </Button>

                    <Button
                      variant="primary"
                      onClick={() => setEditFormId(f.id)}
                      style={{ padding: "6px 12px", fontSize: 12 }}
                    >
                      Pahat Pertanyaan
                    </Button>

                    <Button
                      variant="secondary"
                      style={{ padding: "6px 12px", fontSize: 12 }}
                      onClick={() =>
                        togglePublish(
                          f.id,
                          f.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                        )
                      }
                    >
                      {f.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => togglePrivate(f.id, !f.isPrivate)}
                    >
                      {f.isPrivate ? "Set Public" : "Set Private"}
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => deleteForm(f.id)}
                      style={{
                        padding: "6px 12px",
                        fontSize: 12,
                        marginLeft: "auto",
                      }} 
                    >
                      Bakar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
