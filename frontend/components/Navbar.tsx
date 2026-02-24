"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import { clearToken, getToken } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!getToken());
  }, []);

  function logout() {
    clearToken();
    setAuthed(false);
    router.push("/login");
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">
          FormBuilder
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/forms" className="text-sm text-gray-700 hover:underline">
            Forms
          </Link>
          {authed ? (
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}