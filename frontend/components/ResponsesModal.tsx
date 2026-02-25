"use client";

import { api } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";

type QuestionType = "SHORT_ANSWER" | "MULTIPLE_CHOICE" | "CHECKBOX" | "DROPDOWN";

type Option = { id: string; text: string; order: number };

type Question = {
  id: string;
  title: string;
  type: QuestionType;
  isRequired: boolean;
  order: number;
  options: Option[];
};

type FormDetail = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  questions: Question[];
};

type SubmissionListItem = {
  id: string;
  createdAt: string;
  respondentName?: string | null;
  respondentEmail?: string | null;
  _count?: { answers: number };
};

type Answer = {
  questionId: string;
  valueText?: string | null;
  valueOption?: string | null;
  valueOptions?: string[] | null;
};

type SubmissionDetail = {
  id: string;
  createdAt: string;
  respondentName?: string | null;
  respondentEmail?: string | null;
  answers: Answer[];
};

type Props = {
  open: boolean;
  formId: string | null;
  onClose: () => void;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

// Komponen Bar untuk Grafik Statistik
function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4, color: "rgba(60,36,14,0.95)" }}>
        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{label}</div>
        <div style={{ color: "rgba(120,72,32,0.95)" }}>{value}</div>
      </div>
      <div style={{ height: 8, width: "100%", borderRadius: 4, background: "rgba(120,72,32,0.15)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, rgba(162,108,34,0.95), rgba(120,72,32,0.95))",
            borderRadius: 4,
            transition: "width 0.5s ease-in-out",
          }}
        />
      </div>
    </div>
  );
}

export default function ResponsesModal({ open, formId, onClose }: Props) {
  const [form, setForm] = useState<FormDetail | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SubmissionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load form + submissions
  useEffect(() => {
    if (open && formId) {
      (async () => {
        try {
          setError(null);
          setLoading(true);

          const [formRes, subsRes] = await Promise.all([
            api.get(`/api/forms/${formId}`),
            api.get(`/api/forms/${formId}/submissions`),
          ]);

          setForm(formRes.data.data);
          setSubmissions(subsRes.data.data || []);
        } catch (e: any) {
          setError(e?.response?.data?.message ?? "Gagal membaca jejak jawaban.");
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setForm(null);
      setSubmissions([]);
      setAllAnswersBySubmission(new Map());
    }
  }, [open, formId]);

  // Load submission detail when selectedId changes
  useEffect(() => {
    if (!open || !formId || !selectedId) return;

    (async () => {
      try {
        setDetailLoading(true);
        setSelectedDetail(null);
        const res = await api.get(`/api/forms/${formId}/submissions/${selectedId}`);
        setSelectedDetail(res.data.data);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Gagal memuat detail jawaban.");
      } finally {
        setDetailLoading(false);
      }
    })();
  }, [open, formId, selectedId]);

  const questionById = useMemo(() => {
    const m = new Map<string, Question>();
    (form?.questions || []).forEach((q) => m.set(q.id, q));
    return m;
  }, [form]);

  const [allAnswersBySubmission, setAllAnswersBySubmission] = useState<Map<string, Answer[]>>(new Map());
  const [statsLoading, setStatsLoading] = useState(false);

  async function loadAllAnswersForCharts() {
    if (!formId) return;
    try {
      setStatsLoading(true);
      setError(null);

      const map = new Map<string, Answer[]>();
      for (const s of submissions) {
        const res = await api.get(`/api/forms/${formId}/submissions/${s.id}`);
        map.set(s.id, res.data.data.answers || []);
      }
      setAllAnswersBySubmission(map);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal merapal statistik.");
    } finally {
      setStatsLoading(false);
    }
  }

  const stats = useMemo(() => {
    const optionCounts = new Map<string, Map<string, number>>();
    const textAnswers = new Map<string, string[]>();

    for (const [, answers] of allAnswersBySubmission.entries()) {
      for (const a of answers) {
        const q = questionById.get(a.questionId);
        if (!q) continue;

        if (q.type === "SHORT_ANSWER") {
          const arr = textAnswers.get(q.id) || [];
          if (a.valueText && String(a.valueText).trim() !== "") arr.push(String(a.valueText));
          textAnswers.set(q.id, arr);
        } else if (q.type === "MULTIPLE_CHOICE" || q.type === "DROPDOWN") {
          const raw = a.valueOption ?? a.valueText;
          if (!raw) continue;

          const key = String(raw);
          const m = optionCounts.get(q.id) || new Map<string, number>();
          m.set(key, (m.get(key) || 0) + 1);
          optionCounts.set(q.id, m);
        } else if (q.type === "CHECKBOX") {
          const opts = Array.isArray(a.valueOptions) ? a.valueOptions : [];
          const m = optionCounts.get(q.id) || new Map<string, number>();
          for (const optId of opts) {
            m.set(optId, (m.get(optId) || 0) + 1);
          }
          optionCounts.set(q.id, m);
        }
      }
    }

    return { optionCounts, textAnswers };
  }, [allAnswersBySubmission, questionById]);

  if (!open) return null;

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
          width: "min(860px, 95vw)", // Sedikit lebih lebar karena ada tabel
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
            Kumpulan Respon
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
        <div style={{ padding: 24, overflowY: "auto", flex: 1, color: "rgba(40, 24, 10, 0.95)" }}>
          {error && (
            <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.3)", color: "rgba(220, 38, 38, 0.95)", fontSize: 14, fontWeight: 700 }}>
              {error}
            </div>
          )}

          {loading || !form ? (
            <div style={{ textAlign: "center", padding: "40px 0", fontWeight: 700, opacity: 0.7 }}>
              Mengumpulkan jejak jawaban...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Info & Tombol Load Charts */}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px 0", color: "rgba(60,36,14,0.95)" }}>
                    {form.title}
                  </h1>
                  <p style={{ margin: 0, fontSize: 14, opacity: 0.8, fontWeight: 700 }}>
                    Total: {submissions.length} jawaban tersimpan.
                  </p>
                </div>

                <Button
                  variant="primary"
                  onClick={loadAllAnswersForCharts}
                  disabled={statsLoading || submissions.length === 0}
                >
                  {statsLoading ? "Menerawang..." : "Terawang Statistik (Charts)"}
                </Button>
              </div>

              {/* Charts Section */}
              <div style={{ background: "rgba(255,255,255,0.3)", border: "2px solid rgba(78,52,28,0.25)", borderRadius: 12, padding: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px 0", color: "rgba(60,36,14,0.95)" }}>Statistik</h2>
                
                {allAnswersBySubmission.size === 0 ? (
                  <p style={{ fontSize: 13, opacity: 0.7, margin: 0, fontStyle: "italic" }}>
                    Klik "Terawang Statistik" untuk mengurai angka dari seluruh jawaban.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
                    {form.questions.map((q) => {
                      if (q.type === "SHORT_ANSWER") {
                        const arr = stats.textAnswers.get(q.id) || [];
                        const latest = arr.slice(-10).reverse(); // 10 jawaban terakhir
                        return (
                          <div key={q.id} style={{ background: "rgba(255,255,255,0.4)", borderRadius: 10, border: "1px solid rgba(120,72,32,0.2)", padding: 16 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(40,24,10,0.95)", marginBottom: 12 }}>
                              {q.order}. {q.title} <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.6 }}>(Teks)</span>
                            </div>
                            {arr.length === 0 ? (
                              <div style={{ fontSize: 13, opacity: 0.6, fontStyle: "italic" }}>Belum ada tulisan.</div>
                            ) : (
                              <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                                {latest.map((t, idx) => (
                                  <li key={idx} style={{ background: "rgba(250,239,210,0.7)", padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid rgba(120,72,32,0.15)" }}>
                                    "{t}"
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      }

                      // Untuk Multiple Choice, Checkbox, Dropdown
                      const counts = stats.optionCounts.get(q.id) || new Map<string, number>();
                      const rows = q.options.slice().sort((a, b) => a.order - b.order).map((o) => ({ label: o.text, value: counts.get(o.id) || 0 }));
                      const max = rows.reduce((m, r) => Math.max(m, r.value), 0);

                      return (
                        <div key={q.id} style={{ background: "rgba(255,255,255,0.4)", borderRadius: 10, border: "1px solid rgba(120,72,32,0.2)", padding: 16 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(40,24,10,0.95)", marginBottom: 16 }}>
                            {q.order}. {q.title} <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.6 }}>({q.type.replace("_", " ")})</span>
                          </div>
                          {rows.length === 0 ? (
                            <div style={{ fontSize: 13, opacity: 0.6, fontStyle: "italic" }}>Tidak ada opsi tersedia.</div>
                          ) : (
                            <div>
                              {rows.map((r) => (
                                <BarRow key={r.label} label={r.label} value={r.value} max={max} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submissions Table Section */}
              <div style={{ background: "rgba(255,255,255,0.3)", border: "2px solid rgba(78,52,28,0.25)", borderRadius: 12, padding: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px 0", color: "rgba(60,36,14,0.95)" }}>Daftar Responden</h2>

                {submissions.length === 0 ? (
                  <p style={{ fontSize: 13, opacity: 0.7, margin: 0, fontStyle: "italic" }}>Belum ada responden yang mengisi.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                      <thead>
                        <tr style={{ textAlign: "left", color: "rgba(120,72,32,0.95)", borderBottom: "2px solid rgba(120,72,32,0.3)" }}>
                          <th style={{ padding: "10px 12px 10px 0" }}>Waktu</th>
                          <th style={{ padding: "10px 12px" }}>Pengirim</th>
                          <th style={{ padding: "10px 12px" }}>Total Jawaban</th>
                          <th style={{ padding: "10px 0", textAlign: "right" }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((s) => (
                          <tr key={s.id} style={{ borderBottom: "1px solid rgba(120,72,32,0.15)" }}>
                            <td style={{ padding: "12px 12px 12px 0", fontSize: 13, opacity: 0.85 }}>{formatDate(s.createdAt)}</td>
                            <td style={{ padding: "12px" }}>
                              {s.respondentName || s.respondentEmail ? (
                                <div>
                                  {s.respondentName && <div style={{ fontWeight: 700 }}>{s.respondentName}</div>}
                                  {s.respondentEmail && <div style={{ fontSize: 12, opacity: 0.7 }}>{s.respondentEmail}</div>}
                                </div>
                              ) : (
                                <span style={{ opacity: 0.6, fontStyle: "italic" }}>Anonim</span>
                              )}
                            </td>
                            <td style={{ padding: "12px", fontWeight: 700 }}>{s._count?.answers ?? "-"}</td>
                            <td style={{ padding: "12px 0", textAlign: "right" }}>
                              <Button variant="secondary" onClick={() => setSelectedId(s.id)} style={{ padding: "6px 12px", fontSize: 12 }}>
                                Buka
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Sub-Modal: Detail Jawaban Individual (Tampil bertumpuk di atas jika ada selectedId) 
      */}
      {selectedId && (
        <div
          onClick={() => {
            setSelectedId(null);
            setSelectedDetail(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 100000, // Z-index lebih tinggi dari modal utama
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(600px, 90vw)",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: 12,
              border: "2px solid rgba(60,35,12,0.95)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
              background: "linear-gradient(180deg, #f2e3c6, #e6cfa1)", // Sedikit lebih gelap dari perkamen utama
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "2px solid rgba(120,72,32,0.2)" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "rgba(60,36,14,0.95)" }}>Lembar Jawaban</div>
              <Button variant="secondary" onClick={() => { setSelectedId(null); setSelectedDetail(null); }} style={{ padding: "4px 10px", fontSize: 12 }}>
                Tutup
              </Button>
            </div>

            <div style={{ padding: 20, overflowY: "auto", flex: 1, color: "rgba(40, 24, 10, 0.95)" }}>
              {detailLoading || !selectedDetail ? (
                <div style={{ textAlign: "center", padding: "30px 0", opacity: 0.7, fontWeight: 700 }}>Membaca lembar...</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ background: "rgba(120,72,32,0.1)", padding: 12, borderRadius: 8, border: "1px solid rgba(120,72,32,0.2)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>Waktu: {formatDate(selectedDetail.createdAt)}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>
                      Pengirim: {selectedDetail.respondentName || selectedDetail.respondentEmail ? (
                        <>{selectedDetail.respondentName || "Anonim"} {selectedDetail.respondentEmail && `(${selectedDetail.respondentEmail})`}</>
                      ) : ("Anonim")}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {form?.questions.map((q) => {
                      const a = (selectedDetail.answers || []).find((x) => x.questionId === q.id);
                      let rendered: React.ReactNode = <span style={{ opacity: 0.5, fontStyle: "italic" }}>Tidak dijawab</span>;

                      if (a) {
                        if (q.type === "SHORT_ANSWER") {
                          rendered = a.valueText ? <span>{a.valueText}</span> : rendered;
                        } else if (q.type === "MULTIPLE_CHOICE" || q.type === "DROPDOWN") {
                          const raw = String(a.valueOption ?? a.valueText ?? "");
                          const opt = q.options.find((o) => o.id === raw);
                          rendered = opt ? <span>{opt.text}</span> : raw ? <span>{raw}</span> : rendered;
                        } else if (q.type === "CHECKBOX") {
                          const ids = Array.isArray(a.valueOptions) ? a.valueOptions : [];
                          const labels = ids.map((id) => q.options.find((o) => o.id === id)?.text).filter(Boolean);
                          rendered = labels.length ? (
                            <ul style={{ margin: 0, paddingLeft: 20, listStyleType: "disc" }}>
                              {labels.map((t, idx) => <li key={idx}>{t}</li>)}
                            </ul>
                          ) : rendered;
                        }
                      }

                      return (
                        <div key={q.id} style={{ paddingBottom: 12, borderBottom: "1px dashed rgba(120,72,32,0.3)" }}>
                          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{q.order}. {q.title}</div>
                          <div style={{ fontSize: 14, opacity: 0.9 }}>{rendered}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}