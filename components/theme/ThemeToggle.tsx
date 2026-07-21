"use client";

import { useEffect, useRef, useState } from "react";
import { ThemePreference, useTheme } from "@/components/theme/ThemeProvider";

interface ThemeToggleProps {
  className?: string;
}

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "โหมดสว่าง" },
  { value: "dark", label: "โหมดมืด" },
  { value: "system", label: "ตามระบบ" },
];

function SunIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function SystemIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function iconFor(value: ThemePreference, className?: string) {
  if (value === "light") return <SunIcon className={className} />;
  if (value === "dark") return <MoonIcon className={className} />;
  return <SystemIcon className={className} />;
}

// # ส่วนประกอบ ThemeToggle
// ปุ่มเลือกธีมแบบดรอปดาวน์ รองรับ 3 ตัวเลือก: สว่าง, มืด, ตามระบบ
// 1. อ่านค่าธีมที่เลือกและธีมที่ใช้จริงจาก useTheme()
// 2. แสดงไอคอนของธีมที่ใช้จริง (resolvedTheme) บนปุ่มหลัก
// 3. เปิดเมนูให้เลือกได้ทั้ง 3 ตัวเลือก และปิดเมนูเมื่อคลิกนอกพื้นที่
// 4. ใช้โทเค็นสี (primary/surface/foreground/border) แทนสีที่ตายตัว เพื่อให้ทำงานถูกต้องในทุกธีมและทุกหน้า รวมถึง dashboard
export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title={`Theme: ${OPTIONS.find((o) => o.value === theme)?.label}`}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:text-primary"
      >
        {iconFor(resolvedTheme, "h-4.5 w-4.5")}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-40 rounded-2xl border border-border bg-surface-elevated p-1.5 shadow-2xl backdrop-blur-2xl z-50"
        >
          {OPTIONS.map((option) => {
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-foreground hover:bg-primary/10"
                }`}
              >
                {iconFor(option.value, "h-4 w-4")}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
