// Dashboard Summary Cards Builder
// ฟังก์ชันสำหรับเตรียมข้อมูล (Mapping) เพื่อแสดงใน Summary Cards
// 1. แปลงข้อมูลจาก DashboardPayload ให้เป็น DashboardSummaryCard[]
// 2. กำหนดไอคอน, สี, และข้อความอธิบาย (Hint) สำหรับแต่ละหมวด

import type { DashboardPayload, DashboardSummaryCard } from "./types";

// buildDashboardSummaryCards
// สร้าง Array ของวัตถุข้อมูลสำหรับคอมโพเนนต์ DashboardSummaryCards
// 1. รับก้อนข้อมูลดิบจาก API
// 2. คำนวณค่าสำเร็จ (Done) จากโครงสร้างข้อมูลย่อย
// 3. กำหนดสไตล์การออกแบบ (Gradients/Glows) ให้แต่ละ Card มีเอกลักษณ์
export function buildDashboardSummaryCards(
  data: DashboardPayload,
): DashboardSummaryCard[] {
  const done = data.completion_comparison.successful_submissions;
  // Accent bar + meta colours mirror the five KPI cards on the Admin01 mockup
  // (purple / green / amber / pink / dark), sourced via theme tokens so both
  // the light "Friendly UI" and dark themes stay on-palette.
  return [
    {
      label: "จำนวนทดสอบ",
      hint: "เคสทั้งหมดในระบบ",
      value: data.test_cases_total,
      accentBar: "bg-primary",
      metaClass: "text-primary",
    },
    {
      label: "จำนวนคำถาม",
      hint: "โจทย์ที่เผยแพร่",
      value: data.questions_total,
      accentBar: "bg-secondary",
      metaClass: "text-secondary",
    },
    {
      label: "จำนวนแอดมิน",
      hint: "บัญชีผู้ดูแล",
      value: data.admins_total,
      accentBar: "bg-warning",
      metaClass: "text-warning",
    },
    {
      label: "จำนวน User",
      hint: "ผู้ใช้ที่ลงทะเบียน",
      value: data.users_total,
      accentBar: "bg-heart",
      metaClass: "text-heart",
    },
    {
      label: "ทำสำเร็จแล้ว",
      hint: "การส่งที่ผ่านเกณฑ์",
      value: done,
      accentBar: "bg-foreground",
      metaClass: "text-muted",
    },
  ];
}
