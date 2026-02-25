"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type QuestionType = "SHORT_ANSWER" | "MULTIPLE_CHOICE" | "CHECKBOX" | "DROPDOWN";

type PublicForm = {
  id: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "PUBLISHED";
  pin: string;
  isPrivate: boolean;
  questions: Array<{
    id: string;
    title: string;
    type: QuestionType;
    isRequired: boolean;
    order: number;
    options: Array<{ id: string; text: string; order: number }>;
  }>;
};

type Props = {
  open: boolean;
  pin: string | null;
  onClose: () => void;
};

export default function PublicPinFormModal({ open, pin, onClose }: Props) {
  const [form, setForm] = useState<PublicForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && pin) {
      (async () => {
        try {
          setError(null);
          setLoading(true);
          const res = await api.get(`/api/public/pin/${pin}`);
          setForm(res.data.data);
        } catch (e: any) {
          setError(e?.response?.data?.message ?? "Segel tidak valid atau gulungan telah musnah.");
        } finally {
          setLoading(false);
        }
      })();
    } else {
      // Reset semua state saat modal ditutup
      setForm(null);
      setAnswers({});
      setError(null);
      setSuccessId(null);
    }
  }, [open, pin]);

  function setAnswer(questionId: string, value: any) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function validateRequired() {
    if (!form) return null;
    for (const q of form.questions) {
      if (!q.isRequired) continue;
      const v = answers[q.id];
      const empty =
        v === undefined ||
        v === null ||
        (typeof v === "string" && v.trim() === "") ||
        (Array.isArray(v) && v.length === 0);
      if (empty) return `Ada bagian wajib yang belum kamu isi: ${q.title}`;
    }
    return null;
  }

  async function submit() {
    if (!pin || !form) return;

    const msg = validateRequired();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setError(null);
      setSubmitting(true);

      const payload = {
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          ...(Array.isArray(value)
            ? { valueOptions: value }
            : typeof value === "string"
            ? { valueText: value }
            : { valueOption: value }),
        })),
      };

      const res = await api.post(`/api/public/pin/${pin}/responses`, payload);
      setSuccessId(res.data?.data?.submissionId ?? "OK");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal menyegel jawaban.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  // Agar wrapper modal tetap konsisten (tidak hilang-timbul), 
  // kita menentukan isi (body) berdasarkan state loading/error/success di dalam satu struktur modal.
  
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
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
          width: "min(680px, 95vw)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 14,
          border: "3px solid rgba(78, 52, 28, 0.95)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.6)",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(250,239,210,0.98), rgba(233,214,170,0.98))",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "linear-gradient(180deg, rgba(120, 72, 32, 0.95), rgba(85, 48, 20, 0.95))",
            color: "rgba(255,255,255,0.95)",
            borderBottom: "2px solid rgba(60,35,12,0.95)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>
            {form ? "Membaca Gulungan..." : "Balai Arsip"}
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
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", fontWeight: 700, opacity: 0.7 }}>
              Membuka segel gulungan...
            </div>
          ) : successId ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📜✨</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "rgba(34, 139, 34, 0.95)" }}>Jawaban Telah Tersegel!</h2>
              <p style={{ opacity: 0.8, marginTop: 8 }}>Terima kasih telah mengisi gulungan ini.</p>
              <p style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>(ID: {successId})</p>
              <Button onClick={onClose} style={{ marginTop: 24 }}>Kembali ke Balai</Button>
            </div>
          ) : error && !form ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "2px solid rgba(220, 38, 38, 0.3)",
                  color: "rgba(220, 38, 38, 0.95)",
                  fontWeight: 800,
                  display: "inline-block"
                }}
              >
                {error}
              </div>
              <div style={{ marginTop: 24 }}>
                <Button onClick={onClose}>Kembali</Button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Header Info Form */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>Segel: {form?.pin}</span>
                  {form?.isPrivate && (
                    <span style={{ background: "rgba(120,72,32,0.1)", padding: "2px 8px", borderRadius: 12, border: "1px solid rgba(120,72,32,0.2)" }}>
                      Privat
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: "rgba(60,36,14,0.95)", margin: "0 0 8px 0" }}>
                  {form?.title}
                </h1>
                {form?.description && (
                  <p style={{ margin: 0, fontSize: 15, opacity: 0.85, lineHeight: 1.5 }}>
                    {form.description}
                  </p>
                )}
              </div>

              <div style={{ height: 1, background: "rgba(120,72,32,0.35)" }} />

              {/* Error Pesan (Jika ada error saat submit) */}
              {error && (
                <div style={{ padding: 12, borderRadius: 8, background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.3)", color: "rgba(220, 38, 38, 0.95)", fontSize: 14, fontWeight: 700 }}>
                  {error}
                </div>
              )}

              {/* List Pertanyaan */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {form?.questions.map((q) => (
                  <div key={q.id} style={{ background: "rgba(255,255,255,0.35)", border: "2px solid rgba(78,52,28,0.2)", borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(40,24,10,0.95)", marginBottom: 12 }}>
                      {q.order}. {q.title}{" "}
                      {q.isRequired && <span style={{ color: "rgba(200,50,50,0.95)", fontSize: 14 }}>*</span>}
                    </div>

                    {q.type === "SHORT_ANSWER" && (
                      <Input
                        value={answers[q.id] ?? ""}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                        placeholder="Tuliskan jawabanmu..."
                      />
                    )}

                    {q.type === "MULTIPLE_CHOICE" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.options.map((o) => (
                          <label key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, cursor: "pointer", opacity: 0.9 }}>
                            <input
                              type="radio"
                              name={q.id}
                              checked={answers[q.id] === o.id}
                              onChange={() => setAnswer(q.id, o.id)}
                              style={{ width: 18, height: 18, accentColor: "rgba(120, 72, 32, 0.95)" }}
                            />
                            {o.text}
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === "CHECKBOX" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {q.options.map((o) => {
                          const arr: string[] = answers[q.id] || [];
                          const checked = arr.includes(o.id);
                          return (
                            <label key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, cursor: "pointer", opacity: 0.9 }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) setAnswer(q.id, [...arr, o.id]);
                                  else setAnswer(q.id, arr.filter((x) => x !== o.id));
                                }}
                                style={{ width: 18, height: 18, accentColor: "rgba(120, 72, 32, 0.95)" }}
                              />
                              {o.text}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {q.type === "DROPDOWN" && (
                      <select
                        value={answers[q.id] ?? ""}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                        style={{ padding: "10px 12px", borderRadius: 8, border: "2px solid rgba(78,52,28,0.5)", background: "rgba(255,255,255,0.7)", color: "rgba(40, 24, 10, 0.95)", fontSize: 15, outline: "none", width: "100%", cursor: "pointer" }}
                      >
                        <option value="">-- Pilih --</option>
                        {q.options.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.text}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>

              {/* Tombol Kirim */}
              <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={submit} disabled={submitting} style={{ padding: "12px 24px", fontSize: 16 }}>
                  {submitting ? "Menyegel..." : "Segel & Kirim Jawaban"}
                </Button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}