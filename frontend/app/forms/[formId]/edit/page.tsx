"use client";

import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/requireAuth";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useParams } from "next/navigation";

type QuestionType =
  | "SHORT_ANSWER"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "DROPDOWN";

type Question = {
  id: string;
  title: string;
  type: QuestionType;
  isRequired: boolean;
  order: number;
  options: { id: string; text: string; order: number }[];
};

export default function EditFormPage() {
  useRequireAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<QuestionType>("SHORT_ANSWER");
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ formId: string }>();

  async function load() {
    try {
      const res = await api.get(`/api/forms/${params.formId}/questions`);
      setQuestions(res.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load questions");
    }   
  }

  useEffect(() => {
    load();
  }, []);

  function handleOptionChange(index: number, value: string) {
    const copy = [...options];
    copy[index] = value;
    setOptions(copy);
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  async function createQuestion() {
    if (!title.trim()) return setError("Title required");

    try {
      setLoading(true);
      await api.post(`/api/forms/${params.formId}/questions`, {
        title,
        type,
        isRequired,
        options:
          type !== "SHORT_ANSWER"
            ? options.filter((o) => o.trim()).map((text) => ({ text }))
            : undefined,
      });

      setTitle("");
      setType("SHORT_ANSWER");
      setIsRequired(false);
      setOptions([""]);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to create question");
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;

    try {
      await api.delete(`/api/forms/${params.formId}/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Questions</h1>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border bg-white p-4 shadow-sm space-y-3">
        <Input
          label="Question Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="w-full rounded-xl border px-3 py-2"
          value={type}
          onChange={(e) => setType(e.target.value as QuestionType)}
        >
          <option value="SHORT_ANSWER">Short Answer</option>
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
          <option value="CHECKBOX">Checkbox</option>
          <option value="DROPDOWN">Dropdown</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
          />
          Required
        </label>

        {type !== "SHORT_ANSWER" && (
          <div className="space-y-2">
            {options.map((opt, i) => (
              <Input
                key={i}
                label={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
              />
            ))}
            <Button variant="secondary" onClick={addOption}>
              Add Option
            </Button>
          </div>
        )}

        <Button onClick={createQuestion} disabled={loading}>
          {loading ? "Creating..." : "Add Question"}
        </Button>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className="rounded-xl border p-3 bg-white">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">
                  {q.order}. {q.title}{" "}
                  {q.isRequired && (
                    <span className="text-xs text-red-600">(required)</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{q.type}</div>
              </div>

              <Button variant="danger" onClick={() => deleteQuestion(q.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
