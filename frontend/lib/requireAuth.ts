"use client";

import { getToken } from "./auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) router.replace("/login");
  }, [router]);
}