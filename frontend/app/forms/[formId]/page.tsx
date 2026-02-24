"use client";

import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/requireAuth";
import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useParams } from "next/navigation";

export default function FormDetailPage() {
  useRequireAuth();

  const params = useParams<{ formId: string }>();
  const formId = params?.formId;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) return;

    (async () => {
      try {
        setError(null);
        const res = await api.get(`/api/forms/${formId}`);
        setData(res.data.data);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Gagal load form");
      }
    })();
  }, [formId]);

  if (error) return <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>;
  if (!data) return <div className="text-sm text-gray-600">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{data.title}</h1>
          {data.description ? <p className="text-gray-700">{data.description}</p> : null}
          <p className="text-sm text-gray-600">Status: {data.status}</p>
        </div>

        <div className="flex gap-2">
          <Link href={`/forms/${data.id}/edit`}>
            <Button>Edit Questions</Button>
          </Link>
          <Link href={`/public/forms/${data.id}`}>
            <Button variant="secondary" disabled={data.status !== "PUBLISHED"}>
              Public
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium">Questions</h2>
        {data.questions?.length ? (
          <ol className="mt-3 space-y-2">
            {data.questions.map((q: any) => (
              <li key={q.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {q.order}. {q.title}{" "}
                    {q.isRequired ? <span className="text-xs text-red-600">(required)</span> : null}
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{q.type}</span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-gray-600">Belum ada pertanyaan.</p>
        )}
      </div>
    </div>
  );
}