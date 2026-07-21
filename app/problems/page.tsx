import ProblemDifficultySection, {
  type BrowseProblem,
} from "@/components/problems/browse/ProblemDifficultySection";
import { listProblems } from "@/server/problems/module";

export const dynamic = "force-dynamic";

const difficultySections = [
  {
    difficulty: 1 as const,
    label: "ง่าย",
    eyebrow: "เริ่มต้นที่นี่",
    description:
      "สร้างความมั่นใจจากโจทย์พื้นฐานที่ช่วยให้คุณคุ้นเคยกับแนวคิดและรูปแบบการแก้ปัญหา",
  },
  {
    difficulty: 2 as const,
    label: "ปานกลาง",
    eyebrow: "เพิ่มความท้าทาย",
    description:
      "เชื่อมโยงหลายแนวคิดเข้าด้วยกัน และฝึกวางแผนวิธีแก้ปัญหาที่มีประสิทธิภาพมากขึ้น",
  },
  {
    difficulty: 3 as const,
    label: "ยาก",
    eyebrow: "ทดสอบขีดจำกัด",
    description:
      "ฝึกโจทย์ซับซ้อนที่ต้องอาศัยการวิเคราะห์อย่างเป็นระบบและการเลือกอัลกอริทึมอย่างแม่นยำ",
  },
] as const;

type DifficultyResult = {
  problems: BrowseProblem[];
  total: number;
};

async function loadDifficulty(difficulty: number): Promise<DifficultyResult> {
  try {
    const result = await listProblems({
      difficulty,
      page: 1,
      limit: 6,
    });

    return {
      problems: result.data,
      total: result.pagination.total,
    };
  } catch {
    return { problems: [], total: 0 };
  }
}

export default async function ProblemsPage() {
  const results = await Promise.all(
    difficultySections.map((section) => loadDifficulty(section.difficulty)),
  );
  const totalProblems = results.reduce((sum, result) => sum + result.total, 0);

  return (
    <main className="relative z-10 min-h-screen w-full px-4 pb-28 pt-32 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-4xl text-center">
          <p className="mx-auto inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-primary uppercase">
            Problem Library
          </p>
          <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            เลือกความท้าทายที่เหมาะกับคุณ
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-text-muted sm:text-lg">
            เริ่มจากพื้นฐาน ค่อย ๆ เพิ่มระดับ หรือกระโดดไปทดสอบขีดจำกัด
            ทุกระดับถูกจัดแยกไว้ให้เลือกได้ทันที
          </p>

          <div className="mt-9 grid grid-cols-3 gap-2 sm:gap-4">
            {difficultySections.map((section, index) => (
              <a
                key={section.difficulty}
                href={`#difficulty-${section.difficulty}`}
                className="surface-card group rounded-2xl px-3 py-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 sm:px-5"
              >
                <span className="text-[10px] font-bold tracking-[0.16em] text-text-light uppercase sm:text-xs">
                  0{index + 1}
                </span>
                <span className="mt-1 block text-base font-bold text-foreground group-hover:text-primary sm:text-lg">
                  {section.label}
                </span>
                <span className="mt-1 block text-xs text-text-muted">
                  {results[index].total.toLocaleString()} โจทย์
                </span>
              </a>
            ))}
          </div>

          <p className="mt-4 text-xs text-text-light">
            {totalProblems > 0
              ? `มีโจทย์พร้อมฝึกทั้งหมด ${totalProblems.toLocaleString()} ข้อ`
              : "คลังโจทย์กำลังเตรียมเนื้อหาใหม่สำหรับคุณ"}
          </p>
        </header>

        <div className="mt-20 space-y-20">
          {difficultySections.map((section, index) => (
            <ProblemDifficultySection
              key={section.difficulty}
              {...section}
              problems={results[index].problems}
              total={results[index].total}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
