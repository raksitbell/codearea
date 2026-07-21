import { LayoutWrapper } from "@/components/LayoutWrapper";
import { SessionGuard } from "@/components/auth/SessionGuard";
import { LogoutProvider } from "@/components/auth/LogoutProvider";
import { SvgSprite } from "@/components/icons/SvgSprite";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  display: "swap",
});

const appName =
  process.env.app_name ?? process.env.NEXT_PUBLIC_APP_NAME ?? "CodeArea";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description = `${appName} คือแพลตฟอร์มฝึกทักษะการเขียนโปรแกรมแนว LeetCode สำหรับผู้เรียนและผู้เตรียมสัมภาษณ์งาน พร้อมระบบหลังบ้านสำหรับบริหารโจทย์ แท็ก ประเภท สถิติ และข้อมูลผู้ใช้งานอย่างเป็นระบบ`;
const keywords = [
  "CodeArea",
  "competitive programming",
  "coding challenge",
  "algorithm practice",
  "data structures",
  "LeetCode Thailand",
  "ฝึกเขียนโปรแกรม",
  "ฝึกอัลกอริทึม",
  "โจทย์เขียนโปรแกรม",
  "เตรียมสัมภาษณ์โปรแกรมเมอร์",
  "ระบบจัดการโจทย์",
  "online judge",
];

const themeScript = `
  try {
    const storedTheme = localStorage.getItem("codearea-theme");
    const theme = storedTheme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.classList.add("dark");
  }
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: appName,
  generator: "Next.js",
  category: "technology",
  classification: "Education",
  referrer: "origin-when-cross-origin",
  keywords,
  authors: [{ name: appName }],
  creator: appName,
  publisher: appName,
  title: {
    default: `${appName} - แพลตฟอร์มฝึกทำโจทย์และระบบจัดการหลังบ้าน`,
    template: `%s | ${appName}`,
  },
  description,
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: appName,
    title: `${appName} - แพลตฟอร์มฝึกทำโจทย์และระบบจัดการหลังบ้าน`,
    description,
    locale: "th_TH",
    images: [
      {
        url: "/icon.svg",
        width: 64,
        height: 64,
        alt: `${appName} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} - แพลตฟอร์มฝึกทำโจทย์และระบบจัดการหลังบ้าน`,
    description,
    images: ["/icon.svg"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      data-theme="dark"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansThai.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <SvgSprite />
          <SessionGuard />
          <div className="app-shell relative min-h-screen overflow-x-hidden">
            <div className="relative z-10">
              <LogoutProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
              </LogoutProvider>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
