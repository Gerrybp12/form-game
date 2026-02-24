"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FormListItem } from "@/lib/types";
import { useRequireAuth } from "@/lib/requireAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

export default function FormsPage() {
  useRequireAuth();

  const [items, setItems] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      setError(null);
      setLoading(true);
      const res = await api.get("/api/forms");
      setItems(res.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal load forms");
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
      setError(e?.response?.data?.message ?? "Gagal update status");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createForm() {
    if (!title.trim()) {
      setError("Title wajib diisi.");
      return;
    }
    try {
      setCreating(true);
      await api.post("/api/forms", { title, description: desc || undefined });
      setTitle("");
      setDesc("");
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal create form");
    } finally {
      setCreating(false);
    }
  }

  async function deleteForm(id: string) {
    if (!confirm("Hapus form ini?")) return;
    try {
      await api.delete(`/api/forms/${id}`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Gagal delete form");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Forms</h1>
        <p className="text-sm text-gray-600">Kelola daftar form kamu.</p>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium">Create new form</h2>
        <div className="mt-3 grid gap-3">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <Button onClick={createForm} disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium">Your forms</h2>

        {loading ? (
          <div className="mt-3 text-sm text-gray-600">Loading...</div>
        ) : items.length === 0 ? (
          <div className="mt-3 text-sm text-gray-600">Belum ada form.</div>
        ) : (
          <ul className="mt-3 space-y-3">
            {items.map((f) => (
              <li
                key={f.id}
                className="flex items-start justify-between gap-3 rounded-xl border p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/forms/${f.id}`}
                      className="truncate font-medium hover:underline"
                    >
                      {f.title}
                    </Link>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                      {f.status}
                    </span>
                  </div>
                  {f.description ? (
                    <p className="mt-1 text-sm text-gray-600">
                      {f.description}
                    </p>
                  ) : null}
                  {f._count ? (
                    <p className="mt-1 text-xs text-gray-500">
                      {f._count.questions} questions • {f._count.submissions}{" "}
                      submissions
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {/* Detail page */}
                  <Link href={`/forms/${f.id}`}>
                    <Button variant="secondary">Detail</Button>
                  </Link>

                  {/* Builder page */}
                  <Link href={`/forms/${f.id}/edit`}>
                    <Button>Edit Questions</Button>
                  </Link>

                  {/* Publish toggle */}
                  <Button
                    variant="secondary"
                    onClick={() =>
                      togglePublish(
                        f.id,
                        f.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                      )
                    }
                  >
                    {f.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                  </Button>

                  {/* Public link */}
                  <Link href={`/public/forms/${f.id}`}>
                    <Button
                      variant="secondary"
                      disabled={f.status !== "PUBLISHED"}
                    >
                      Public link
                    </Button>
                  </Link>

                  {/* Delete */}
                  <Button variant="danger" onClick={() => deleteForm(f.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
