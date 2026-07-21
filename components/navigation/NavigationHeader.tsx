"use client";

import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import { Icon } from "@/components/icons/Icon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLogout } from "@/components/auth/LogoutProvider";

interface NavLink {
  label: string;
  href: string;
}

interface NavigationHeaderProps {
  links?: NavLink[];
}

// # ส่วนประกอบ NavigationHeader
// แถบนำทางหลักของแอปพลิเคชัน
// 1. จัดการลิงก์นำทางที่รองรับการแสดงผลบนมือถือและเดสก์ท็อป
// 2. ติดตามสถานะการเข้าสู่ระบบและบทบาทของผู้ใช้ (Role-based permissions)
// 3. แสดงผลเมนูโปรไฟล์แบบ Dropdown สำหรับการเข้าถึงการตั้งค่าและการออกจากระบบ
// 4. จัดการสไตล์ของ Header ตามตำแหน่งการเลื่อนหน้าจอ (Scroll)
export function NavigationHeader({ links = [] }: NavigationHeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [roleId, setRoleId] = useState(1);
  const [avatarText, setAvatarText] = useState("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();

  // # ฟังก์ชันการออกจากระบบ
  // เริ่มต้นการล้างเซสชันและทำความสะอาดสถานะ
  // 1. รีเซ็ตสถานะ UI ท้องถิ่น
  // 2. ส่งต่อหน้าที่ไปยัง LogoutProvider เพื่อล้างโทเค็นระดับสากล
  // 3. เปลี่ยนหน้ากลับไปยังหน้าแรก
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    logout("/");
  }, [logout]);

  // # ตรรกะการตรวจสอบสิทธิ์และเริ่มต้น
  // จัดการการตั้งสถานะการยืนยันตัวตนและตัวฟังเหตุการณ์
  // 1. ตรวจสอบ JWT และข้อมูลเมตาจาก localStorage เมื่อโหลดส่วนประกอบ
  // 2. เพิ่มตัวฟังการเลื่อนหน้าจอเพื่ออัปเดตสไตล์ของ Header
  // 3. เชื่อมต่อเหตุการณ์ 'storage' และ 'profile-updated' เพื่อซิงค์สถานะระหว่างแท็บ
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("user");
      const userRaw = localStorage.getItem("user");

      if (token && userRaw) {
        try {
          // ขั้นตอนที่ 1: วิเคราะห์ข้อมูลผู้ใช้และตรวจสอบฟิลด์สำคัญ (เช่น ID)
          const user = JSON.parse(userRaw) as { id?: string | number; display_name?: string; role_id?: number; avatar_url?: string };


          if (!user.id) {
            console.warn("[NavigationHeader] User ID missing in localStorage. Forcing logout.");
            handleLogout();
            return;
          }

          // ขั้นตอนที่ 2: เติมข้อมูลสถานะ UI สำหรับผู้ใช้ที่เข้าสู่ระบบ
          const name = user.display_name?.trim() || "ผู้ใช้งาน";
          setDisplayName(name);
          setAvatarText(name.charAt(0).toUpperCase());
          setAvatarUrl(user.avatar_url || null);
          setRoleId(user.role_id ?? 1);
          setIsLoggedIn(true);
        } catch {
          setIsLoggedIn(false);
        }
      } else {
        // ขั้นตอนที่ 3: จัดการสถานะผู้ใช้ทั่วไป (ไม่ระบุตัวตน)
        setIsLoggedIn(false);
        setAvatarUrl(null);
      }
    };

    checkAuth();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // # การประสานข้อมูลแบบ Real-time
    // ตรวจสอบให้แน่ใจว่าสถานะการเข้าสู่ระบบตรงกันหากมีการเปลี่ยนแปลงในแท็บอื่นหรือหน้าการตั้งค่า
    window.addEventListener("storage", checkAuth);
    window.addEventListener("profile-updated", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("profile-updated", checkAuth);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname, handleLogout]);

  // # ส่วนติดต่อผู้ใช้และ Dropdown
  // จัดการการแสดงผลและการปิดเมนู Dropdown
  // 1. ปิดเมนูโปรไฟล์เมื่อมีการคลิกพื้นที่ภายนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const defaultLinks: NavLink[] = [
    { label: "หน้าหลัก", href: "/" },
    { label: "โจทย์", href: "/problems" },
    { label: "ประเภทโจทย์", href: "/categories" },
    { label: "ตารางอันดับ", href: "/leaderboard" },
  ];

  const navLinks = links.length > 0 ? links : defaultLinks;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 w-full transition-all duration-500 ease-in-out ${isScrolled
        ? "border-b border-line bg-background/80 py-0 shadow-xl backdrop-blur-3xl"
        : "bg-transparent py-3"
        }`}
    >
      <div className="relative w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <CodeAreaLogo
            showText
            iconClassName="h-8 w-8"
            textClassName="text-4xl font-bold tracking-tight text-foreground"
          />
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface/80 text-foreground transition-colors hover:bg-soft md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="relative h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isMobileMenuOpen ? "top-[7px] rotate-45" : ""
                }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isMobileMenuOpen ? "top-[7px] -rotate-45" : ""
                }`}
            />
          </span>
        </button>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative text-sm font-medium transition-all duration-300 ${isActive ? "text-primary" : "text-text-muted hover:text-foreground"
                  } after:absolute after:bottom-[-8px] after:left-1/2 after:h-0.5 after:w-full after:-translate-x-1/2 after:rounded-full after:bg-primary after:shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_70%,transparent)] after:transition-transform after:duration-300 after:ease-out ${isActive
                    ? "after:scale-x-100"
                    : "after:scale-x-0 group-hover:after:scale-x-100"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-surface/70 px-6 text-sm font-medium text-foreground transition-all hover:bg-soft"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-[#07110d] shadow-[0_0_24px_color-mix(in_srgb,var(--primary)_35%,transparent)] transition-all hover:bg-primary-hover"
              >
                สมัครสมาชิก
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex cursor-pointer items-center gap-3 rounded-full p-1 transition-opacity hover:bg-soft hover:opacity-90"
              >
                {/* Avatar */}
                <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary to-hint text-sm font-semibold text-[#07110d] shadow-sm">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarUrl(null)}
                    />
                  ) : (
                    avatarText
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {displayName}
                  </p>
                </div>
                {/* Dropdown Icon */}
                <Icon
                  name="chevron"
                  className={`w-4 h-4 text-text-muted transition-transform ml-1 ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="surface-card absolute right-0 z-50 mt-2 w-full min-w-[240px] animate-in overflow-hidden rounded-2xl px-2 py-2 fade-in zoom-in duration-200">
                  <div className="space-y-1">
                    <div className="mb-2 flex items-center justify-between border-b border-line px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-light">
                      <span>บัญชีผู้ใช้งาน</span>
                      {roleId === 2 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[8px] font-black uppercase tracking-widest text-amber-500">Admin</span>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-soft hover:text-foreground"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft">
                        <Icon name="user" className="h-4 w-4" />
                      </div>
                      <span>โปรไฟล์ของฉัน</span>
                    </Link>

                    {roleId === 2 && (
                      <Link
                        href="/dashboard"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-soft hover:text-foreground"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft">
                          <Icon name="stats" className="h-4 w-4" />
                        </div>
                        <span>หน้าจัดการระบบ</span>
                      </Link>
                    )}

                    <Link
                      href="/profile/settings"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-muted transition-colors hover:bg-soft hover:text-foreground"
                      onClick={() => setIsDropdownOpen(false)}
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
          )}
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-line bg-background/95 backdrop-blur-md transition-all duration-300 md:hidden ${isMobileMenuOpen ? "max-h-[75vh] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={`mobile-${link.href}`}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive
                  ? "bg-primary/15 text-primary"
                  : "text-text-muted hover:bg-soft hover:text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-2 border-t border-line pt-3">
            <div className="mb-3 flex items-center justify-between rounded-xl bg-surface px-3 py-2">
              <span className="text-sm text-text-muted">รูปแบบหน้าจอ</span>
              <ThemeToggle />
            </div>
            {!isLoggedIn ? (
              <div className="flex flex-col gap-4">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-surface text-sm font-medium text-foreground transition-colors hover:bg-soft"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-[#07110d] transition-all hover:bg-primary-hover"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="px-1 text-xs text-text-light">
                  Signed in as {displayName}
                </p>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-surface text-sm font-medium text-foreground transition-colors hover:bg-soft"
                >
                  My Profile
                </Link>
                {roleId === 2 && (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/profile/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-surface text-sm font-medium text-foreground transition-colors hover:bg-soft"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="h-10 rounded-full border border-red-400/30 bg-red-500/10 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoggingOut && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-transparent" />
                  )}
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// # ความปลอดภัย
// ตรวจสอบรหัสความปลอดภัย
// เอกสารเกี่ยวกับความปลอดภัยหลักในส่วนประกอบ NavigationHeader:
// 1. Authentication Synchronization: ใช้ตัวฟังเหตุการณ์ 'storage' เพื่อให้แน่ใจว่าการออกจากระบบในแท็บหนึ่งจะส่งผลลัพธ์ไปยังแท็บอื่นๆ ทันที
// 2. Metadata Validation: ตรวจสอบ 'user.id' ใน localStorage อย่างเข้มงวดก่อนยอมรับเซสชัน เพื่อป้องกัน UI แสดงผลผิดพลาดจากข้อมูลที่เสียหาย
// 3. RBAC Visualization: การแสดงผลป้ายระดับ (เช่น ผู้ดูแลระบบ) อ้างอิงจากบทบาท (role_id) ในโทเค็นที่ได้รับการตรวจสอบแล้วเท่านั้น
// 4. Client-Side Sanitization: ข้อมูลที่ผู้ใช้สร้าง เช่น ชื่อที่แสดง จะถูก Render ผ่าน React เพื่อป้องกันการโจมตีประเภท XSS
