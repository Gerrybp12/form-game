"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PublicFormItem = {
  id: string;
  title: string;
  description?: string | null;
  pin: string;
  updatedAt: string;
};

export default function PublicHomePage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [items, setItems] = useState<PublicFormItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await api.get("/api/public/forms");
        setItems(res.data.data);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Gagal load public forms");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function enterPin() {
    const p = pin.trim();
    if (!/^\d{6}$/.test(p)) {
      setError("PIN harus 6 digit.");
      return;
    }
    router.push(`/public/pin/${p}`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">Public</h1>
        <p className="text-sm text-gray-600">
          Pilih form publik, atau masuk lewat PIN (private maupun public).
        </p>

        {error ? (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Masukkan PIN 6 digit"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <Button onClick={enterPin}>Enter</Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium">Discover</h2>

        {loading ? (
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        ) : items.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">Belum ada form publik.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {items.map((f) => (
              <li key={f.id} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium">{f.title}</div>
                    {f.description ? (
                      <div className="text-sm text-gray-600">{f.description}</div>
                    ) : null}
                    <div className="mt-1 text-xs text-gray-500">
                      PIN: {f.pin}
                    </div>
                  </div>

                  <Link href={`/public/pin/${f.pin}`}>
                    <Button variant="secondary">Open</Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}