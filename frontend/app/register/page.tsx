"use client";

import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Struktur data diubah menjadi object untuk memisahkan Icon dan Path
const CHARACTER_OPTIONS = [
  {
    id: "male_rouge",
    icon: "/sprites_icon/male_rouge.png", // Gambar kecil di Register
    path: "/sprites/male_rouge.png",                     // Value yang dikirim ke DB
  },
  {
    id: "female_rouge",
    icon: "/sprites_icon/female_rouge.png",
    path: "/sprites/female_rouge.png",
  },
  {
    id: "knight",
    icon: "/sprites_icon/knight.png",
    path: "/sprites/knight.png",
  },
  {
    id: "princess",
    icon: "/sprites_icon/princess.png",
    path: "/sprites/princess.png",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State sekarang menyimpan "path" dari karakter yang dipilih
  const [characterPath, setCharacterPath] = useState(CHARACTER_OPTIONS[0].path);
  
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
      // characterPath (contoh: "/assets/characters/knight_full.png") dikirim ke backend
      const res = await api.post("/api/auth/register", { 
        name, 
        email, 
        password, 
        avatarPath: characterPath 
      });
      setToken(res.data.token);
      router.push("/");
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

            {/* Area Pemilihan Karakter */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              <label style={{ fontSize: 14, fontWeight: 800, color: "rgba(40, 24, 10, 0.95)" }}>
                Pilih Identitas (Avatar)
              </label>
              <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
                {CHARACTER_OPTIONS.map((char) => {
                  // Cek apakah path karakter ini sama dengan yang ada di state
                  const isSelected = characterPath === char.path;
                  
                  return (
                    <div
                      key={char.id}
                      onClick={() => setCharacterPath(char.path)}
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        borderRadius: 10,
                        cursor: "pointer",
                        overflow: "hidden",
                        border: isSelected
                          ? "3px solid rgba(120, 72, 32, 0.95)"
                          : "2px solid rgba(78,52,28,0.3)",
                        boxShadow: isSelected
                          ? "0 0 12px rgba(120, 72, 32, 0.5)"
                          : "none",
                        transform: isSelected ? "scale(1.05)" : "scale(1)",
                        transition: "all 0.2s ease-in-out",
                        background: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {/* Yang dirender/ditampilkan adalah char.icon */}
                      <img 
                        src={char.icon} 
                        alt={`Icon ${char.id}`} 
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
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