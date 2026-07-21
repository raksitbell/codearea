import { Icon } from "@/components/icons/Icon";
import Link from "next/link";

export type BrowseProblem = {
  code: string;
  title: string;
  difficulty: number | string | null;
  points?: number | null;
  category_name?: string | null;
};

type Difficulty = 1 | 2 | 3;

type ProblemDifficultySectionProps = {
  difficulty: Difficulty;
  label: string;
  eyebrow: string;
  description: string;
  problems: BrowseProblem[];
  total: number;
};

const styles: Record<
  Difficulty,
  {
    accent: string;
    badge: string;
    icon: string;
    empty: string;
  }
> = {
  1: {
    accent: "text-growth",
    badge: "border-growth/30 bg-growth/10 text-growth",
    icon: "bg-growth/15 text-growth",
    empty: "from-growth/10",
  },
  2: {
    accent: "text-energy",
    badge: "border-energy/30 bg-energy/10 text-energy",
    icon: "bg-energy/15 text-energy",
    empty: "from-energy/10",
  },
  3: {
    accent: "text-heart",
    badge: "border-heart/30 bg-heart/10 text-heart",
    icon: "bg-heart/15 text-heart",
    empty: "from-heart/10",
  },
};

export default function ProblemDifficultySection({
  difficulty,
  label,
  eyebrow,
  description,
  problems,
  total,
}: ProblemDifficultySectionProps) {
  const style = styles[difficulty];

  return (
    <section id={`difficulty-${difficulty}`} className="scroll-mt-28">
      <div className="flex flex-col gap-5 border-b border-line pb-7 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${style.icon}`}
              aria-hidden="true"
            >
              <span className="font-mono text-sm font-black">0{difficulty}</span>
            </span>
            <div>
              <p
                className={`text-xs font-bold tracking-[0.16em] uppercase ${style.accent}`}
              >
                {eyebrow}
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-foreground">
                ระดับ{label}
              </h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-text-muted sm:text-base">
            {description}
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${style.badge}`}
        >
          {total.toLocaleString()} โจทย์พร้อมฝึก
        </span>
      </div>

      {problems.length > 0 ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {problems.map((problem) => (
            <ProblemCard
              key={problem.code}
              problem={problem}
              difficulty={difficulty}
              badgeClassName={style.badge}
            />
          ))}
        </div>
      ) : (
        <div
          className={`mt-7 overflow-hidden rounded-3xl border border-dashed border-line bg-linear-to-br ${style.empty} via-surface to-surface p-8 sm:p-10`}
        >
          <div className="flex max-w-xl flex-col items-start sm:flex-row sm:items-center sm:gap-6">
            <div
              className={`mb-5 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${style.icon} sm:mb-0`}
            >
              <Icon name="problem" className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                ยังไม่มีโจทย์ระดับ{label}ในตอนนี้
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                เรากำลังเตรียมโจทย์ชุดใหม่สำหรับระดับนี้
                โปรดกลับมาตรวจสอบอีกครั้งในภายหลัง
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ProblemCard({
  problem,
  difficulty,
  badgeClassName,
}: {
  problem: BrowseProblem;
  difficulty: Difficulty;
  badgeClassName: string;
}) {
  const points = Number(problem.points) || 0;

  return (
    <Link
      href={`/problems/${encodeURIComponent(problem.code)}`}
      className="surface-card group flex min-h-56 flex-col rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/45"
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${badgeClassName}`}
        >
          ระดับ {difficulty}
        </span>
        <span className="font-mono text-xs text-text-light">
          {problem.code}
        </span>
      </div>

      <div className="mt-8 flex-1">
        <p className="text-xs font-bold tracking-[0.12em] text-text-light uppercase">
          {problem.category_name || "General"}
        </p>
        <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-snug text-foreground transition group-hover:text-primary">
          {problem.title}
        </h3>
      </div>

      <div className="mt-7 flex items-center justify-between border-t border-line pt-4">
        <span className="text-xs font-medium text-text-muted">
          {points > 0 ? `${points.toLocaleString()} คะแนน` : "เริ่มฝึกโจทย์"}
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-soft text-foreground transition group-hover:bg-primary group-hover:text-[#07110d]">
          <Icon name="chevron-right" className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
