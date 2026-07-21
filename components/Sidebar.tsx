"use client";

import { useLogout } from "@/components/auth/LogoutProvider";
import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const { logout, isLoggingOut } = useLogout();

  const handleLogout = () => {
    logout("/");
  };

  return (
    <aside
      className={`fixed bottom-0 left-0 top-0 z-40 flex flex-col overflow-y-auto border-r border-white/10 bg-sidebar backdrop-blur-md transition-[width] duration-200 ${
        collapsed ? "w-[84px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex h-16 items-center border-b border-white/5 ${
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

      <div className={`border-t border-white/10 ${collapsed ? "p-2" : "p-3"}`}>
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
