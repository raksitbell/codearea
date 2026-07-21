"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

/** The user's stored preference: an explicit theme, or "system" to follow the OS. */
export type ThemePreference = "light" | "dark" | "system";
/** The theme actually applied to the document (never "system"). */
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "codearea-theme";
const DEFAULT_PREFERENCE: ThemePreference = "system";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

function resolveSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? resolveSystemTheme() : preference;
}

interface ThemeContextType {
  /** "light" | "dark" | "system" — what the user picked. */
  theme: ThemePreference;
  /** "light" | "dark" — what is actually rendered right now. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDocument(resolved: ResolvedTheme) {
  document.documentElement.setAttribute("data-theme", resolved);
}

// # ส่วนประกอบ ThemeProvider
// จัดการสถานะธีม (สว่าง/มืด/ตามระบบ) ทั่วทั้งแอปพลิเคชัน รวมถึงหน้าจัดการระบบ (dashboard)
// 1. โหลดค่าที่บันทึกไว้ใน localStorage เมื่อเริ่มต้น (ค่าเริ่มต้นคือ "system")
// 2. เมื่อเลือก "system" จะติดตาม prefers-color-scheme ของอุปกรณ์แบบเรียลไทม์
// 3. ซิงค์แอตทริบิวต์ data-theme บน <html> ทุกครั้งที่ธีมที่ใช้จริงเปลี่ยน เพื่อให้โทเค็นสีใน globals.css ทำงาน
// 4. ให้ useTheme() สำหรับอ่าน/ตั้งค่าธีมจากที่ใดก็ได้ในต้นไม้ของคอมโพเนนต์
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(
    DEFAULT_PREFERENCE,
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

  // Read the persisted preference on mount. The inline script in layout.tsx
  // already applied data-theme before hydration, so this only syncs React state.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const preference: ThemePreference =
      stored === "dark" || stored === "light" || stored === "system"
        ? stored
        : DEFAULT_PREFERENCE;
    setThemeState(preference);
    setResolvedTheme(resolveTheme(preference));
  }, []);

  // Apply + persist whenever the preference changes.
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyThemeToDocument(resolved);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // While following "system", react live to OS-level theme changes.
  useEffect(() => {
    if (theme !== "system" || !window.matchMedia) return;

    const media = window.matchMedia(MEDIA_QUERY);
    const handleChange = () => {
      const resolved = resolveSystemTheme();
      setResolvedTheme(resolved);
      applyThemeToDocument(resolved);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Inline, render-blocking script string used in the document head so the
// correct data-theme attribute is set before first paint (no flash of the
// wrong theme). Keep this in sync with STORAGE_KEY/DEFAULT_PREFERENCE above.
export const themeInitScript = `(function(){try{var k="${STORAGE_KEY}";var s=localStorage.getItem(k);var p=s==="light"||s==="dark"||s==="system"?s:"${DEFAULT_PREFERENCE}";var r=p==="system"?(window.matchMedia&&window.matchMedia("${MEDIA_QUERY}").matches?"dark":"light"):p;document.documentElement.setAttribute("data-theme",r);}catch(e){}})();`;
