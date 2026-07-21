// Dashboard Completion Chart Component
// คอมโพเนนต์แสดงกราฟวงกลม (Pie Chart) เปรียบเทียบสัดส่วนการส่งโค้ด
// 1. แสดงผลสำเร็จ (Accepted) เทียบกับ ไม่สำเร็จ (Fail/Error)
// 2. ใช้ Gradients เพื่อความสวยงามแบบ Premium
// 3. จัดการเรื่อง Hydration ด้วย isMounted เพื่อป้องกันการทำงานผิดพลาดบน Server-side

"use client";

import { useId } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DashboardPanelHeader } from "./DashboardPanelHeader";
import type { PieRow } from "./types";
import { pieFillForLabel } from "./utils";

type DashboardCompletionChartProps = {
  pieRows: PieRow[];
  successfulSubmissions: number;
  unsuccessfulSubmissions: number;
};

// DashboardCompletionChart
// ส่วนดึงข้อมูลและจัดการกราฟสถิติ
// 1. ใช้ useId เพื่อสร้าง Unique ID สำหรับ Gradient ป้องกันการซ้ำซ้อน
// 2. ใช้ isMounted เพื่อรอกราฟโหลดในฝั่ง Client
export function DashboardCompletionChart({
  pieRows,
  successfulSubmissions,
  unsuccessfulSubmissions,
}: DashboardCompletionChartProps) {
  const uid = useId().replace(/:/g, "");
  const successId = `dashPieSuccess-${uid}`;
  const failId = `dashPieFail-${uid}`;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <DashboardPanelHeader
        className="mb-1"
        title="เปรียบเทียบความสำเร็จ"
        subtitle="สัดส่วนการส่งที่สำเร็จและยังไม่สำเร็จ"
      />
      <div className="relative mt-2 flex flex-1 flex-col">
        {/* เลเยอร์แสงฟุ้ง (Glow Effect) */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.06] blur-3xl"
          aria-hidden
        />
        <div className="relative w-full min-w-0 min-h-[280px]">
          <ResponsiveContainer
            width="100%"
            minWidth={0}
            minHeight={280}
            aspect={1.55}
            debounce={80}
          >
            <PieChart>
              <defs>
                {/* นิยามสี Gradient สำหรับส่วนที่ผ่าน */}
                <linearGradient id={successId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5eead4" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                {/* นิยามสี Gradient สำหรับส่วนที่ไม่ผ่าน */}
                <linearGradient id={failId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fcd34d" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
              <Pie
                data={pieRows}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={3}
                stroke="var(--surface)"
                strokeWidth={2}
                cornerRadius={4}
              >
                {pieRows.map((row) => (
                  <Cell
                    key={row.name}
                    fill={pieFillForLabel(row.name, successId, failId)}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  fontSize: "12px",
                  color: "var(--foreground)",
                }}
                labelStyle={{ color: "var(--foreground)", marginBottom: 4 }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "12px",
                }}
                formatter={(value) => (
                  <span className="text-muted">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* ส่วนแสดงป้ายกำกับด้านล่างแบบกำหนดเอง */}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-4 py-1.5 text-xs text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            สำเร็จ{" "}
            <strong className="tabular-nums">
              {successfulSubmissions.toLocaleString("th-TH")}
            </strong>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-warning/25 bg-warning/10 px-4 py-1.5 text-xs text-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            ไม่สำเร็จ{" "}
            <strong className="tabular-nums">
              {unsuccessfulSubmissions.toLocaleString("th-TH")}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
