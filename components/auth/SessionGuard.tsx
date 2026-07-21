"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { api } from "@/lib/api";
import { clearAuthSession } from "@/lib/authUtils";

type AuthMeResponse = {
  user: {
    id: number;
    email: string;
    display_name: string;
    role_id: number;
  };
};

type AuthUser = {
  id: number;
  email: string;
  display_name: string;
  role_id: number;
};


export function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    const validateSession = async () => {
      const localUserRaw = localStorage.getItem("user");

      let localUser: AuthUser | null = null;
      try {
        localUser = localUserRaw ? JSON.parse(localUserRaw) as AuthUser : null;
      } catch {
        clearAuthSession();
      }

      const meRes = await api.get<AuthMeResponse>("/auth/me", { useToken: true });
      if (!active) return;

      // Don't force logout on transient network errors/timeouts.
      if (!meRes.ok && meRes.status !== 401 && meRes.status !== 403) {
        return;
      }

      const serverUser = meRes.data?.user;
      if (meRes.ok && serverUser) {
        const isCurrent = localUser?.id === serverUser.id && localUser.email === serverUser.email;
        if (!isCurrent) {
          localStorage.setItem("user", JSON.stringify(serverUser));
          window.dispatchEvent(new Event("storage"));
        }
        return;
      }

      if (!localUser) return;
      const isMismatch =
        meRes.status === 401 ||
        meRes.status === 403 ||
        !serverUser ||
        serverUser.id !== localUser.id ||
        serverUser.email !== localUser.email;

      if (!isMismatch) return;
      if (!active) return;

      console.warn("[SessionGuard] Session mismatch or 401 detected, clearing storage and redirecting to /login", {
        status: meRes.status,
        mismatch: isMismatch
      });

      clearAuthSession();

      await Swal.fire({
        icon: "warning",
        title: "Session หมดอายุ",
        text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
      });

      const loginHref = pathname.startsWith("/dashboard")
        ? `/login?from=${encodeURIComponent(pathname)}`
        : "/login";
      router.replace(loginHref);
    };

    validateSession();

    return () => {
      active = false;
    };
  }, [router, pathname]);

  return null;
}
