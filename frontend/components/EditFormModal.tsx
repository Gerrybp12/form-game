"use client";

import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/requireAuth";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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

type Props = {
  open: boolean;
  onClose: () => void;
  formId: string | null; // Menerima formId dari parent, bukan dari useParams
};

export default function EditFormModal({ open, onClose, formId }: Props) {
  useRequireAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<QuestionType>("SHORT_ANSWER");
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!formId) return;
    try {
      setError(null);
      const res = await api.get(`/api/forms/${formId}/questions`);
      setQuestions(res.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal memuat pertanyaan");
    }
  }

  // Load data setiap kali modal dibuka dan formId valid
  useEffect(() => {
    if (open && formId) {
      load();
    }
  }, [open, formId]);

  function handleOptionChange(index: number, value: string) {
    const copy = [...options];
    copy[index] = value;
    setOptions(copy);
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  async function createQuestion() {
    if (!formId) return;
    if (!title.trim()) return setError("Judul pertanyaan wajib diisi");

    try {
      setLoading(true);
      await api.post(`/api/forms/${formId}/questions`, {
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
      setError(e?.response?.data?.message ?? "Gagal membuat pertanyaan");
    } finally {
      setLoading(false);
    }
  }

  async function deleteQuestion(id: string) {
    if (!formId) return;
    if (!confirm("Hapus baris pertanyaan ini dari gulungan?")) return;

    try {
      await api.delete(`/api/forms/${formId}/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "Gagal menghapus pertanyaan");
    }
  }

  // Reset state jika ditutup agar tidak bocor ke form lain
  function handleClose() {
    setTitle("");
    setType("SHORT_ANSWER");
    setIsRequired(false);
    setOptions([""]);
    setError(null);
    onClose();
  }

  if (!open || !formId) return null;

  return (
    <div
      onClick={handleClose}
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
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }}>
              Pahat Pertanyaan
            </div>
          </div>
          <button
            onClick={handleClose}
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

          {/* Form Create Question */}
          <div
            style={{
              background: "rgba(255,255,255,0.4)",
              border: "2px solid rgba(78,52,28,0.4)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "rgba(60,36,14,0.95)" }}>
              Tambah Pertanyaan Baru
            </h3>
            
            <Input
            autoFocus
            onKeyDown={(e) => e.stopPropagation()}
              label="Judul Pertanyaan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 800, color: "rgba(40, 24, 10, 0.95)" }}>Tipe Jawaban</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as QuestionType)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "2px solid rgba(78,52,28,0.5)",
                  background: "rgba(255,255,255,0.7)",
                  color: "rgba(40, 24, 10, 0.95)",
                  fontSize: 14,
                  outline: "none",
                  width: "100%",
                  cursor: "pointer",
                }}
              >
                <option value="SHORT_ANSWER">Short Answer</option>
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="CHECKBOX">Checkbox</option>
                <option value="DROPDOWN">Dropdown</option>
              </select>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
              <input
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "rgba(120, 72, 32, 0.95)" }}
              />
              Wajib Diisi (Required)
            </label>

            {type !== "SHORT_ANSWER" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, paddingLeft: 12, borderLeft: "2px solid rgba(120,72,32,0.3)" }}>
                {options.map((opt, i) => (
                  <Input
                  autoFocus
                  onKeyDown={(e) => e.stopPropagation()}
                    key={i}
                    label={`Opsi ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                ))}
                <div style={{ marginTop: 4 }}>
                  <Button variant="secondary" onClick={addOption} type="button">
                    + Tambah Opsi
                  </Button>
                </div>
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <Button onClick={createQuestion} disabled={loading} style={{ width: "100%" }}>
                {loading ? "Memahat..." : "Simpan Pertanyaan"}
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

          {/* List of Existing Questions */}
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 800, color: "rgba(60,36,14,0.95)" }}>
            Daftar Pertanyaan ({questions.length})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {questions.length === 0 ? (
              <div style={{ fontSize: 14, opacity: 0.7, fontStyle: "italic" }}>Belum ada pertanyaan pada gulungan ini.</div>
            ) : (
              questions.map((q) => (
                <div
                  key={q.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    background: "rgba(255,255,255,0.25)",
                    border: "2px solid rgba(78,52,28,0.2)",
                    borderRadius: 12,
                    padding: "12px 16px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "rgba(40,24,10,0.95)" }}>
                      {q.order}. {q.title}{" "}
                      {q.isRequired && (
                        <span style={{ fontSize: 12, color: "rgba(200,50,50,0.95)", marginLeft: 4 }}>
                          *
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, marginTop: 4 }}>
                      Tipe: {q.type.replace("_", " ")}
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    onClick={() => deleteQuestion(q.id)}
                    style={{ padding: "6px 12px", fontSize: 12 }}
                  >
                    Hapus
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}