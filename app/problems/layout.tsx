import type { Metadata } from "next";

const appName =
  process.env.app_name ?? process.env.NEXT_PUBLIC_APP_NAME ?? "CodeArea";

export const metadata: Metadata = {
  title: `โจทย์ทั้งหมด | ${appName}`,
  description:
    "เลือกฝึก Problem ตามระดับง่าย ปานกลาง และยาก พร้อมเส้นทางที่ชัดเจนสำหรับทุกระดับทักษะ",
};

export default function QuestionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
