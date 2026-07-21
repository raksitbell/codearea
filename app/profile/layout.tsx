"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (!token) {
      router.replace("/login");
      setIsAuthorized(false);
      return;
    }
    setIsAuthorized(true);
  }, [router]);



  if (isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthorized === false) return null;

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        className="app-shell relative isolate flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden"
      >
        <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col pt-20">
          {children}
        </div>
      </div>
    </div>
  );
}
