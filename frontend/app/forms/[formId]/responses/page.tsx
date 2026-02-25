"use client";

import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/requireAuth";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

type QuestionType =
  | "SHORT_ANSWER"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "DROPDOWN";

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

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function BarRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="truncate">{label}</div>
        <div className="text-gray-600">{value}</div>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-black"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ResponsesPage() {
  useRequireAuth();

  const params = useParams<{ formId: string }>();
  const formId = params?.formId;

  const [form, setForm] = useState<FormDetail | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SubmissionDetail | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);

  // Load form + submissions
  useEffect(() => {
    if (!formId) return;

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
        setError(e?.response?.data?.message ?? "Gagal load responses");
      } finally {
        setLoading(false);
      }
    })();
  }, [formId]);

  // Load submission detail when selectedId changes
  useEffect(() => {
    if (!formId || !selectedId) return;

    (async () => {
      try {
        setDetailLoading(true);
        setSelectedDetail(null);
        const res = await api.get(
          `/api/forms/${formId}/submissions/${selectedId}`,
        );
        setSelectedDetail(res.data.data);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Gagal load submission detail");
      } finally {
        setDetailLoading(false);
      }
    })();
  }, [formId, selectedId]);

  // Build quick lookup for questions/options
  const questionById = useMemo(() => {
    const m = new Map<string, Question>();
    (form?.questions || []).forEach((q) => m.set(q.id, q));
    return m;
  }, [form]);

  // Stats computed from ALL submissions by pulling details per submission is expensive.
  // For level 4 "chart", we’ll compute from available detail endpoint by loading each submission detail lazily?
  // Instead: we compute charts using only selectedDetail? Not great.
  // Better compromise: compute charts by fetching each submission detail once (simple + ok for assignment).
  const [allAnswersBySubmission, setAllAnswersBySubmission] = useState<
    Map<string, Answer[]>
  >(new Map());
  const [statsLoading, setStatsLoading] = useState(false);

  async function loadAllAnswersForCharts() {
    if (!formId) return;
    try {
      setStatsLoading(true);
      setError(null);

      const map = new Map<string, Answer[]>();
      // sequential to avoid hammering; ok for assignment-size
      for (const s of submissions) {
        const res = await api.get(`/api/forms/${formId}/submissions/${s.id}`);
        map.set(s.id, res.data.data.answers || []);
      }
      setAllAnswersBySubmission(map);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal load data untuk chart");
    } finally {
      setStatsLoading(false);
    }
  }

  // Aggregate stats per question
  const stats = useMemo(() => {
    // questionId -> optionId -> count
    const optionCounts = new Map<string, Map<string, number>>();
    // questionId -> text answers
    const textAnswers = new Map<string, string[]>();

    for (const [, answers] of allAnswersBySubmission.entries()) {
      for (const a of answers) {
        const q = questionById.get(a.questionId);
        if (!q) continue;

        if (q.type === "SHORT_ANSWER") {
          const arr = textAnswers.get(q.id) || [];
          if (a.valueText && String(a.valueText).trim() !== "")
            arr.push(String(a.valueText));
          textAnswers.set(q.id, arr);
        } else if (q.type === "MULTIPLE_CHOICE" || q.type === "DROPDOWN") {
          const raw = a.valueOption ?? a.valueText; // <— penting
          if (!raw) continue;

          const key = String(raw); // biasanya optionId
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

  if (!formId) return <div className="text-sm text-gray-600">Loading...</div>;

  if (loading) return <div className="text-sm text-gray-600">Loading...</div>;

  if (error)
    return (
      <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
        {error}
      </div>
    );

  if (!form) return <div className="text-sm text-gray-600">Form not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Responses</h1>
          <p className="text-sm text-gray-600">
            {form.title} • {submissions.length} submissions
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={`/forms/${formId}`}>
            <Button variant="secondary">Back</Button>
          </Link>
          <Button
            variant="secondary"
            onClick={loadAllAnswersForCharts}
            disabled={statsLoading || submissions.length === 0}
          >
            {statsLoading ? "Loading charts..." : "Load Charts"}
          </Button>
        </div>
      </div>

      {/* Charts */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium">Charts</h2>
        <p className="mt-1 text-sm text-gray-600">
          Klik “Load Charts” untuk menghitung statistik dari semua submissions.
        </p>

        {allAnswersBySubmission.size === 0 ? (
          <div className="mt-3 text-sm text-gray-600">
            Belum ada data chart.
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {form.questions.map((q) => {
              if (q.type === "SHORT_ANSWER") {
                const arr = stats.textAnswers.get(q.id) || [];
                const latest = arr.slice(-10).reverse();
                return (
                  <div key={q.id} className="rounded-xl border p-3">
                    <div className="font-medium">
                      {q.order}. {q.title}{" "}
                      <span className="text-xs text-gray-500">
                        (Short Answer)
                      </span>
                    </div>
                    {arr.length === 0 ? (
                      <div className="mt-2 text-sm text-gray-600">
                        Belum ada jawaban.
                      </div>
                    ) : (
                      <ul className="mt-2 space-y-1 text-sm text-gray-700">
                        {latest.map((t, idx) => (
                          <li key={idx} className="rounded-lg bg-gray-50 p-2">
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              }

              const counts =
                stats.optionCounts.get(q.id) || new Map<string, number>();
              const rows = q.options
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((o) => ({ label: o.text, value: counts.get(o.id) || 0 }));
              const max = rows.reduce((m, r) => Math.max(m, r.value), 0);

              return (
                <div key={q.id} className="rounded-xl border p-3">
                  <div className="font-medium">
                    {q.order}. {q.title}{" "}
                    <span className="text-xs text-gray-500">({q.type})</span>
                  </div>
                  {rows.length === 0 ? (
                    <div className="mt-2 text-sm text-gray-600">
                      Tidak ada opsi.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {rows.map((r) => (
                        <BarRow
                          key={r.label}
                          label={r.label}
                          value={r.value}
                          max={max}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submissions table */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium">Submissions</h2>

        {submissions.length === 0 ? (
          <div className="mt-2 text-sm text-gray-600">
            Belum ada submission.
          </div>
        ) : (
          <div className="mt-3 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Respondent</th>
                  <th className="py-2 pr-3">Answers</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="py-2 pr-3">{formatDate(s.createdAt)}</td>
                    <td className="py-2 pr-3">
                      {s.respondentName || s.respondentEmail ? (
                        <div className="space-y-0.5">
                          {s.respondentName ? (
                            <div>{s.respondentName}</div>
                          ) : null}
                          {s.respondentEmail ? (
                            <div className="text-xs text-gray-600">
                              {s.respondentEmail}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-gray-600">Anonymous</span>
                      )}
                    </td>
                    <td className="py-2 pr-3">{s._count?.answers ?? "-"}</td>
                    <td className="py-2 pr-3">
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedId(s.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simple modal */}
      {selectedId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <div className="font-medium">Submission Detail</div>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedId(null);
                  setSelectedDetail(null);
                }}
              >
                Close
              </Button>
            </div>

            <div className="p-4">
              {detailLoading || !selectedDetail ? (
                <div className="text-sm text-gray-600">Loading...</div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    {formatDate(selectedDetail.createdAt)} •{" "}
                    {selectedDetail.respondentName ||
                    selectedDetail.respondentEmail ? (
                      <>
                        {selectedDetail.respondentName || "Anonymous"}{" "}
                        {selectedDetail.respondentEmail
                          ? `(${selectedDetail.respondentEmail})`
                          : ""}
                      </>
                    ) : (
                      "Anonymous"
                    )}
                  </div>

                  <div className="space-y-3">
                    {form.questions.map((q) => {
                      const a = (selectedDetail.answers || []).find(
                        (x) => x.questionId === q.id,
                      );

                      let rendered: React.ReactNode = (
                        <span className="text-gray-600">—</span>
                      );

                      if (a) {
                        if (q.type === "SHORT_ANSWER") {
                          rendered = a.valueText ? (
                            <span>{a.valueText}</span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          );
                        } else if (
                          q.type === "MULTIPLE_CHOICE" ||
                          q.type === "DROPDOWN"
                        ) {
                          const raw =
                            (a.valueOption ?? a.valueText)
                              ? String(a.valueOption ?? a.valueText)
                              : "";
                          const opt = q.options.find((o) => o.id === raw);
                          rendered = opt ? (
                            <span>{opt.text}</span>
                          ) : raw ? (
                            <span>{raw}</span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          );
                        } else if (q.type === "CHECKBOX") {
                          const ids = Array.isArray(a.valueOptions)
                            ? a.valueOptions
                            : [];
                          const labels = ids
                            .map(
                              (id) => q.options.find((o) => o.id === id)?.text,
                            )
                            .filter(Boolean);
                          rendered = labels.length ? (
                            <ul className="list-disc pl-5">
                              {labels.map((t, idx) => (
                                <li key={idx}>{t}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-600">—</span>
                          );
                        }
                      }

                      return (
                        <div key={q.id} className="rounded-xl border p-3">
                          <div className="font-medium">
                            {q.order}. {q.title}
                          </div>
                          <div className="mt-1 text-sm text-gray-800">
                            {rendered}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
