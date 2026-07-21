"use client";

import { useLogout } from "@/components/auth/LogoutProvider";
import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import { Icon } from "@/components/icons/Icon";
import type { IndexJobsSummary } from "@/components/dashboard/types";
import { api } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface MenuItem {
  label: string;
  href: string;
  iconName: string;
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    items: [
      {
        label: "ภาพรวม",
        href: "/dashboard",
        iconName: "stats",
      },
    ],
  },
  {
    title: "ทั่วไป",
    items: [
      {
        label: "ประเภทโจทย์",
        href: "/dashboard/problem-types",
        iconName: "problem-type",
      },
      {
        label: "แท็ก",
        href: "/dashboard/tags",
        iconName: "tag",
      },
      { label: "โจทย์", href: "/dashboard/problems", iconName: "problem" },
      {
        label: "สร้าง Problem",
        href: "/dashboard/problems/new",
        iconName: "plus",
      },
    ],
  },
  {
    title: "ระบบ",
    items: [
      {
        label: "จัดการผู้ใช้",
        href: "/dashboard/users",
        iconName: "user",
      },
      {
        label: "การส่งคำตอบ",
        href: "/dashboard/submissions",
        iconName: "history",
      },
      {
        label: "งาน Index",
        href: "/dashboard/index-jobs",
        iconName: "cpu",
      },
    ],
  },
  {
    title: "รายงาน",
    items: [
      {
        label: "สถิติการส่งตามหมวดหมู่",
        href: "/dashboard/category-stats",
        iconName: "submission",
      },
      {
        label: "สถิติการส่งตามโจทย์",
        href: "/dashboard/problem-stats",
        iconName: "stats",
      },
      {
        label: "กิจกรรมผู้ใช้",
        href: "/dashboard/user-activity",
        iconName: "activity",
      },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

type AdminProfile = {
  displayName: string;
  roleId: string;
  avatarUrl: string;
};

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const { logout, isLoggingOut } = useLogout();
  const [status, setStatus] = useState<IndexJobsSummary | null>(null);
  const [profile, setProfile] = useState<AdminProfile>({
    displayName: "ผู้ดูแลระบบ",
    roleId: "2",
    avatarUrl: "",
  });

  const handleLogout = () => {
    logout("/");
  };

  useEffect(() => {
    const userRaw = window.localStorage.getItem("user");
    if (!userRaw) return;
    try {
      const user = JSON.parse(userRaw) as {
        display_name?: string;
        role_id?: number | string;
        avatar_url?: string;
      };
      setProfile({
        displayName: user.display_name?.trim() || "ผู้ดูแลระบบ",
        roleId: String(user.role_id ?? "2"),
        avatarUrl: user.avatar_url || "",
      });
    } catch (e) {
      console.error("[Sidebar] Failed to parse user data", e);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void api
      .get<IndexJobsSummary>("/dashboard/index-jobs/summary", { useToken: true })
      .then((res) => {
        if (!cancelled && res.ok && res.data) setStatus(res.data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const roleLabel = useMemo(
    () => (profile.roleId === "2" ? "Admin" : "User"),
    [profile.roleId],
  );

  const initials = useMemo(() => {
    const trimmed = profile.displayName.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : "A";
  }, [profile.displayName]);

  return (
    <aside
      className={`fixed bottom-0 left-0 top-0 z-40 flex flex-col overflow-y-auto border-r border-white/10 bg-sidebar backdrop-blur-md transition-[width] duration-200 ${
        collapsed ? "w-[84px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex h-16 items-center border-b border-line ${
          collapsed ? "justify-between px-2" : "justify-between px-4"
        }`}
      >
        <Link
          href="/"
          className={`flex items-center hover:opacity-90 transition-opacity ${
            collapsed ? "justify-center pl-1" : "gap-2.5"
          }`}
        >
          <CodeAreaLogo iconClassName="h-8 w-8" />
          {!collapsed ? (
            <span className="text-lg font-black text-sidebar-foreground tracking-widest uppercase">
              CodeArea
            </span>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-lg border border-white/10 bg-white/5 text-xs text-sidebar-foreground/80 hover:bg-white/10 ${
            collapsed ? "h-6 w-6" : "h-8 w-8"
          }`}
          aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 py-4 ${collapsed ? "px-2 space-y-4" : "px-3 space-y-6"}`}
      >
        {menuGroups.map((group, groupIndex) => {
          const visibleItems = group.items;

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title ?? `nav-${groupIndex}`}>
              {!collapsed && group.title ? (
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
                  {group.title}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        title={item.label}
                        href={item.href}
                        className={`flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
                          collapsed
                            ? "justify-center px-2 py-2.5"
                            : "gap-3 px-3 py-2.5"
                        } ${
                          isActive
                            ? "bg-sidebar-active text-sidebar-active-content"
                            : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground"
                        }`}
                      >
                        <span
                          className={
                            isActive
                              ? "text-sidebar-active-content"
                              : "text-sidebar-muted"
                          }
                        >
                          <Icon name={item.iconName} className="h-5 w-5" />
                        </span>
                        {!collapsed ? item.label : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* System / Worker status — sourced from Penpot "Admin01 / Admin Dashboard —
          Main": System label + System state + Worker state, derived from the
          ai_index_jobs queue via /dashboard/index-jobs/summary. */}
      {status ? (
        <div
          className={`border-t border-line ${collapsed ? "flex flex-col items-center gap-2 p-2" : "space-y-2 px-4 py-3"}`}
        >
          {!collapsed ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
              System
            </p>
          ) : null}
          <div className={`flex items-center gap-2 ${collapsed ? "flex-col" : ""}`}>
            <span
              title={`System: ${status.system_state}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                status.system_state === "healthy"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${status.system_state === "healthy" ? "bg-emerald-400" : "bg-red-400"}`}
              />
              {!collapsed ? (status.system_state === "healthy" ? "Healthy" : "Attention") : null}
            </span>
            <span
              title={`Worker: ${status.worker_state}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                status.worker_state === "processing"
                  ? "bg-primary/10 text-primary"
                  : status.worker_state === "waiting"
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-white/5 text-sidebar-muted"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status.worker_state === "processing"
                    ? "bg-primary"
                    : status.worker_state === "waiting"
                      ? "bg-amber-400"
                      : "bg-sidebar-muted"
                }`}
              />
              {!collapsed
                ? status.worker_state === "processing"
                  ? "Processing"
                  : status.worker_state === "waiting"
                    ? "Waiting"
                    : "Idle"
                : null}
            </span>
          </div>
        </div>
      ) : null}

      {/* Admin profile — sourced from Penpot "Admin profile": avatar/initials,
          name, and role, read from the same localStorage "user" payload used
          by components/Header.tsx. */}
      <div className={`border-t border-line ${collapsed ? "p-2" : "p-3"}`}>
        <div
          className={`flex items-center rounded-lg ${collapsed ? "justify-center px-1 py-2" : "gap-3 px-2 py-2"}`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary to-hint text-sm font-semibold text-[#07110d]">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {profile.displayName}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-muted">
                {roleLabel}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className={`border-t border-line ${collapsed ? "p-2" : "p-3"}`}>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex w-full items-center rounded-lg text-sm font-medium transition-all duration-150 ${
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          } text-red-400/80 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50`}
          title={isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
        >
          <span className="text-red-400">
            {isLoggingOut ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
            ) : (
              <Icon name="logout" className="h-5 w-5" />
            )}
          </span>
          {!collapsed && (
            <span>{isLoggingOut ? "กำลังออก..." : "ออกจากระบบ"}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
