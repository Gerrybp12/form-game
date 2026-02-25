"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

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

export default function PublicPinFormPage() {
  const params = useParams<{ pin: string }>();
  const pin = params?.pin;

  const [form, setForm] = useState<PublicForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!pin) return;

    (async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await api.get(`/api/public/pin/${pin}`);
        setForm(res.data.data);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "PIN tidak valid / form tidak tersedia");
      } finally {
        setLoading(false);
      }
    })();
  }, [pin]);

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
      if (empty) return `Pertanyaan wajib belum diisi: ${q.title}`;
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
        // respondentName / respondentEmail opsional kalau backend kamu menerimanya:
        // respondentName: "...",
        // respondentEmail: "...",
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
      setError(e?.response?.data?.message ?? "Gagal submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (!pin) return <div className="text-sm text-gray-600">Loading...</div>;

  if (loading) return <div className="text-sm text-gray-600">Loading form...</div>;

  if (error)
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
        <Link href="/public" className="underline text-sm">
          Back to Public
        </Link>
      </div>
    );

  if (!form) return <div className="text-sm text-gray-600">Form not found</div>;

  if (successId)
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
          Submitted 🎉 (submissionId: {successId})
        </div>
        <Link href="/public" className="underline text-sm">
          Back to Public
        </Link>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-xs text-gray-500">
          PIN: {form.pin} {form.isPrivate ? "• Private" : ""}
        </div>
        <h1 className="text-2xl font-semibold">{form.title}</h1>
        {form.description ? <p className="mt-1 text-gray-700">{form.description}</p> : null}
      </div>

      <div className="space-y-3">
        {form.questions.map((q) => (
          <div key={q.id} className="rounded-2xl border bg-white p-4 shadow-sm space-y-2">
            <div className="font-medium">
              {q.order}. {q.title}{" "}
              {q.isRequired ? <span className="text-xs text-red-600">(required)</span> : null}
            </div>

            {q.type === "SHORT_ANSWER" && (
              <Input
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder="Jawaban..."
              />
            )}

            {q.type === "MULTIPLE_CHOICE" &&
              q.options.map((o) => (
                <label key={o.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === o.id}
                    onChange={() => setAnswer(q.id, o.id)}
                  />
                  {o.text}
                </label>
              ))}

            {q.type === "CHECKBOX" &&
              q.options.map((o) => {
                const arr: string[] = answers[q.id] || [];
                const checked = arr.includes(o.id);
                return (
                  <label key={o.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setAnswer(q.id, [...arr, o.id]);
                        else setAnswer(q.id, arr.filter((x) => x !== o.id));
                      }}
                    />
                    {o.text}
                  </label>
                );
              })}

            {q.type === "DROPDOWN" && (
              <select
                className="w-full rounded-xl border px-3 py-2"
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              >
                <option value="">Select</option>
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

      <Button onClick={submit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </div>
  );
}