// Dashboard Top Questions Component
// คอมโพเนนต์แสดงรายการโจทย์ยอดนิยม 5 อันดับแรก
// 1. แสดงชื่อโจทย์และรหัสโจทย์ (Code)
// 2. เรียงลำดับตามจำนวนครั้งที่มีการส่งโค้ด
// 3. ใช้การออกแบบที่เน้นความทันสมัยด้วยเลขลำดับและ Badge สถิติ

import { DashboardPanelHeader } from "./DashboardPanelHeader";
import type { DashboardPayload } from "./types";

type DashboardTopQuestionsProps = {
  questions: DashboardPayload["top_questions"];
};

// DashboardTopQuestions
// ส่วนจัดเรียงและแสดงผลรายการโจทย์ที่มีการส่งสูงสุด
// 1. รับข้อมูล questions จาก DashboardPayload
// 2. แสดงตัวเลขลำดับ 1-5 ในกล่อง Gradient
// 3. จัดการ Layout ให้ลื่นไหลด้วย Hover Effect บนรายการโจทย์
export function DashboardTopQuestions({
  questions,
}: DashboardTopQuestionsProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <DashboardPanelHeader
        className="mb-5"
        title="โจทย์ยอดนิยม 5 อันดับ"
        subtitle="เรียงจากจำนวนครั้งที่ถูกส่ง"
      />
      <ul className="flex flex-1 flex-col gap-2">
        {questions.map((q, index) => (
          <li key={q.question_id}>
            <div className="group flex items-center gap-3 rounded-2xl border border-transparent bg-surface-elevated/40 px-3 py-3 transition hover:border-border hover:bg-surface-elevated/70">
              {/* ตัวเลขลำดับยอดนิยม */}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary ring-1 ring-primary/20 transition group-hover:bg-primary/25">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {q.title}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">
                  {q.code}
                </p>
              </div>
              {/* Badge แสดงจำนวนการส่ง */}
              <span className="shrink-0 rounded-lg bg-secondary/15 px-2.5 py-1 text-xs font-semibold tabular-nums text-secondary ring-1 ring-secondary/25">
                {q.submission_count.toLocaleString("th-TH")}{" "}
                <span className="font-normal opacity-70">ครั้ง</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
