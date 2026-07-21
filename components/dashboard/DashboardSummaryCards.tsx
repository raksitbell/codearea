// Dashboard Summary Cards Component
// คอมโพเนนต์แสดงผลสรุปตัวเลขสำคัญ (KPIs) ในรูปแบบ Card
// อ้างอิงดีไซน์จาก Penpot page "Admin01 — Admin Dashboard": การ์ดพื้นผิวสว่าง
// มีแถบสีเน้นด้านบน (accent bar), หัวข้อตัวพิมพ์ใหญ่, ตัวเลขหลัก และบรรทัด meta
// ใช้ theme token (surface/border/foreground/muted) เพื่อรองรับทั้งธีมสว่างและมืด

import type { DashboardSummaryCard } from "./types";

type DashboardSummaryCardsProps = {
  cards: DashboardSummaryCard[];
};

// DashboardSummaryCards
// ส่วนวนลูปแสดง Card ทั้งหมด
// 1. ใช้ Grid System ให้เหมาะสมกับขนาดหน้าจอ (1-5 คอลัมน์)
// 2. แถบสีด้านบนแยกแต่ละหมวดตามดีไซน์
// 3. จัดตัวเลขให้เป็นฟอนต์ Tabular Nums (ความกว้างเท่ากัน) เพื่อความอ่านง่าย
export function DashboardSummaryCards({ cards }: DashboardSummaryCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          {/* แถบสีเน้นด้านบนการ์ด */}
          <span
            aria-hidden
            className={`absolute inset-x-0 top-0 h-1 ${card.accentBar}`}
          />
          <div className="p-5">
            {/* หัวข้อของการ์ด */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {card.label}
            </p>
            {/* ค่าตัวเลขหลัก (ฟอร์แมตแบบไทย) */}
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
              {card.value.toLocaleString("th-TH")}
            </p>
            {/* คำอธิบายเพิ่มเติมด้านล่าง */}
            <p className={`mt-2 text-xs ${card.metaClass}`}>{card.hint}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
