"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { useLogout } from "@/components/auth/LogoutProvider";
import { ThemeToggle } from "@/components/theme";

interface HeaderProps {
  title: string;
  icon?: React.ReactNode;
  showUserDropdown?: boolean;
}

export default function Header({ title, icon, showUserDropdown = true }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userData, setUserData] = useState({ name: "ผู้ใช้งาน", role: "1", avatar_url: "" });

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userRaw = window.localStorage.getItem("user");
        if (userRaw) {
          const user = JSON.parse(userRaw) as { display_name?: string; role_id?: number | string; avatar_url?: string };
          setUserData({
            name: user.display_name?.trim() || "ผู้ใช้งาน",
            role: String(user.role_id || "1"),
            avatar_url: user.avatar_url || ""
          });
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    };

    checkAuth();

    // Listen for storage changes (for same-tab sync and other tabs)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const displayName = userData.name;
  const roleId = userData.role;
  const avatarUrl = userData.avatar_url;

  const roleLabel = useMemo(() => {
    return roleId === "2" ? "Admin" : "User";
  }, [roleId]);

  const avatarText = useMemo(() => {
    const trimmed = displayName.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : "U";
  }, [displayName]);

  const { logout, isLoggingOut } = useLogout();

  const handleLogout = useCallback(() => {
    logout("/");
  }, [logout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-line bg-background/80 px-6 backdrop-blur-xl">
      {/* Page Title */}
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-primary">{icon}</span>}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right side: theme + notification + user */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {showUserDropdown && (
          <>
            {/* Divider */}
            <div className="h-8 w-px bg-line" />

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="group flex cursor-pointer items-center gap-3 rounded-2xl p-1.5 pr-3 transition-all hover:bg-soft"
              >
                {/* Avatar */}
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary to-hint text-sm font-semibold text-[#07110d] shadow-sm transition-transform group-hover:scale-105">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    avatarText
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-foreground leading-tight transition-colors group-hover:text-primary">
                    {displayName}
                  </p>
                  <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">{roleLabel}</span>
                    <Icon name="chevron-down" className={`h-3 w-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="surface-card absolute right-0 z-50 mt-2 w-full min-w-[240px] animate-in overflow-hidden rounded-2xl px-2 py-2 fade-in zoom-in duration-200">
                  <div className="space-y-1">
                    <div className="mb-2 flex items-center justify-between border-b border-line px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-light">
                      <span>บัญชีผู้ใช้งาน</span>
                      {roleId === "2" && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[8px] font-black uppercase tracking-widest text-amber-500">Admin</span>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-soft hover:text-foreground"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft">
                        <Icon name="user" className="h-4 w-4" />
                      </div>
                      <span>โปรไฟล์ของฉัน</span>
                    </Link>

                    {roleId === "2" && (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-soft hover:text-foreground"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft">
                          <Icon name="stats" className="h-4 w-4" />
                        </div>
                        <span>หน้าจัดการระบบ</span>
                      </Link>
                    )}

                    <Link
                      href="/profile/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-soft hover:text-foreground"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft">
                        <Icon name="gear" className="h-4 w-4" />
                      </div>
                      <span>ตั้งค่าโปรไฟล์</span>
                    </Link>

                    <div className="my-1 h-px bg-line" />

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors rounded-xl text-left disabled:opacity-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-400/5 flex items-center justify-center">
                        {isLoggingOut ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                        ) : (
                          <Icon name="logout" className="h-4 w-4" />
                        )}
                      </div>
                      <span>{isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
