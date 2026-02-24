"use client";

import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !email || password.length < 6) {
      setError("Nama & email wajib, password minimal 6 karakter.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/auth/register", { name, email, password });
      setToken(res.data.token);
      router.push("/forms");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Register gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 14,
          border: "3px solid rgba(78, 52, 28, 0.95)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(250,239,210,0.98), rgba(233,214,170,0.98))",
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: "16px 20px",
            background:
              "linear-gradient(180deg, rgba(120, 72, 32, 0.95), rgba(85, 48, 20, 0.95))",
            color: "rgba(255,255,255,0.95)",
            textAlign: "center",
            borderBottom: "2px solid rgba(60,35,12,0.95)",
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.5, margin: 0 }}>
            Pendaftaran Baru
          </h1>
        </div>

        {/* Form Body */}
        <div style={{ padding: "24px 20px", color: "rgba(40, 24, 10, 0.95)" }}>
          <p
            style={{
              fontSize: 14,
              marginBottom: 20,
              textAlign: "center",
              lineHeight: 1.45,
            }}
          >
            Tempa identitas barumu untuk mulai
            <br /> menciptakan dan mengelola gulungan.
          </p>

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
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <Input 
              label="Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <Input 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />

            <div style={{ marginTop: 8 }}>
              <Button type="submit" style={{ width: "100%" }} disabled={loading}>
                {loading ? "Menempa akun..." : "Create Account"}
              </Button>
            </div>
          </form>

          {/* Separator Line */}
          <div
            style={{
              height: 1,
              background: "rgba(120,72,32,0.35)",
              margin: "24px 0 16px 0",
            }}
          />

          <p style={{ fontSize: 14, textAlign: "center", margin: 0 }}>
            Sudah memiliki segel portal?{" "}
            <Link
              href="/login"
              style={{
                color: "rgba(120, 72, 32, 0.95)",
                fontWeight: 800,
                textDecoration: "underline",
              }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}