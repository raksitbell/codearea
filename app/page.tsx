import ScrollRevealSection from "@/components/home/ScrollRevealSection";
import { Icon } from "@/components/icons/Icon";
import { currentUser } from "@/server/auth/request";
import { listProblems } from "@/server/problems/module";
import Link from "next/link";

const aiGuidanceImage = "/asset/ai_human.jpeg";

export const dynamic = "force-dynamic";

type MissionDifficulty = "HARD" | "MEDIUM" | "EASY";
type ApiDifficulty = 1 | 2 | 3;
type TrendingMission = {
  code: string;
  title: string;
  difficulty: MissionDifficulty;
  description?: string | null;
  points: number;
};

type TrendingProblem = {
  code: string;
  title: string;
  description?: string | null;
  difficulty: ApiDifficulty;
  points: number;
};

function mapApiDifficulty(difficulty: ApiDifficulty): MissionDifficulty {
  if (difficulty === 1) return "EASY";
  if (difficulty === 2) return "MEDIUM";
  return "HARD";
}

async function getTrendingMissions(): Promise<TrendingMission[]> {
  const response = await listProblems({ page: 1, limit: 3 });
  return (response.data as TrendingProblem[]).map((problem) => ({
    code: problem.code,
    title: problem.title,
    difficulty: mapApiDifficulty(problem.difficulty),
    description: problem.description ?? null,
    points: problem.points,
  }));
}

export default async function Home() {
  const user = await currentUser().catch(() => null);
  const isLoggedIn = Boolean(user);
  const showDashboard = user?.role === "admin";
  const missions = await getTrendingMissions();

  return (
    <main className="flex w-full flex-col items-center py-16 md:py-20 lg:py-24">
      <div className="relative z-10 w-full space-y-24 px-4 sm:px-6 md:px-12 lg:px-20 xl:max-w-7xl">
        <ScrollRevealSection className="rounded-[2rem] px-4 py-12 text-center sm:px-8 lg:py-20">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
            <Icon name="rocket" className="h-4 w-4" />
            ระบบเวอร์ชัน 1.0.0 พร้อมใช้งานแล้ว
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black leading-tight tracking-tight">
            ยินดีต้อนรับสู่{" "}
            <span className="bg-linear-to-r from-growth via-energy to-hint bg-clip-text text-transparent">
              ประตูสู่
            </span>{" "}
            <span className="text-foreground">อนาคตแห่งการเขียนโค้ด</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-text-muted">
            ยกระดับศักยภาพด้านวิศวกรรมของคุณด้วยสภาพแวดล้อมที่มี AI ช่วยเสริม
            สนามฝึกแข่งขันที่สมจริง และเครือข่ายนักพัฒนาชั้นนำจากทั่วโลก
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <>
                <Link
                  href="/problems"
                  className="rounded-full bg-primary px-8 py-3 text-lg font-semibold text-[#07110d] shadow-[0_15px_35px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:bg-primary-hover"
                >
                  เริ่มทำโจทย์
                </Link>
                {showDashboard ? (
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-line bg-surface/80 px-8 py-3 text-lg font-semibold text-foreground transition hover:bg-soft"
                  >
                    ไปที่แดชบอร์ด
                  </Link>
                ) : null}
              </>
            ) : (
              <Link
                href="/register"
                className="rounded-full bg-primary px-8 py-3 text-lg font-semibold text-[#07110d] shadow-[0_15px_35px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:bg-primary-hover"
              >
                เริ่มต้นตอนนี้
              </Link>
            )}
          </div>
        </ScrollRevealSection>

        <ScrollRevealSection className="grid gap-6 rounded-3xl lg:grid-cols-3">
          {/* Real-Time AI Guidance - 2/3 width */}
          <article className="surface-card overflow-hidden rounded-3xl p-5 lg:col-span-2 sm:p-6">
            <div className="grid items-stretch gap-5 md:grid-cols-2">
              <div className="flex flex-col justify-center">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Icon name="feature-1" className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-2xl font-semibold sm:text-3xl">
                  AI แนะนำแบบเรียลไทม์
                </h3>
                <p className="text-base text-text-muted sm:text-lg">
                  ผู้ช่วยอัจฉริยะจะวิเคราะห์แนวทางการเขียนโค้ดของคุณและให้คำแนะนำ
                  โดยไม่เฉลยคำตอบตรงๆ
                </p>
              </div>
              <div
                className="min-h-[220px] rounded-2xl bg-cover bg-center md:min-h-[280px]"
                style={{ backgroundImage: `url(${aiGuidanceImage})` }}
              />
            </div>
          </article>

          {/* Algorithm Practice - 1/3 width */}
          <article className="surface-card rounded-3xl p-6 lg:col-span-1">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-energy/15 text-energy">
              <Icon name="feature-2" className="h-5 w-5" />
            </div>
            <h3 className="text-2xl font-semibold">ฝึกโจทย์อัลกอริทึม</h3>
            <p className="mt-2 text-lg text-text-muted">
              ฝึกทำโจทย์ที่คัดสรรมาเป็นลำดับ
              เพื่อพัฒนาความแม่นยำด้านโครงสร้างข้อมูลและการปรับประสิทธิภาพ
            </p>
          </article>

          {/* Seamless Ecosystem - 1/3 width (bottom-left) */}
          <article className="surface-card rounded-3xl p-6 py-12 lg:col-span-1">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-hint/15 text-hint">
              <Icon name="feature-3" className="h-5 w-5" />
            </div>
            <h3 className="text-2xl font-semibold">
              ระบบนิเวศที่เชื่อมต่อไร้รอยต่อ
            </h3>
            <p className="mt-2 text-lg text-text-muted">
              เชื่อมต่อกับ GitHub, VS Code และระบบ API ต่างๆ
              เพื่อเวิร์กโฟลว์การเขียนโค้ดระดับมืออาชีพ
            </p>
          </article>

          {/* Enterprise-Grade Sandboxing - 2/3 width bottom-right */}
          <article className="surface-card grid grid-cols-1 gap-4 rounded-3xl p-5 lg:col-span-2 sm:p-6 md:grid-cols-5">
            <div className="md:col-span-3">
              <p className="text-2xl text-primary">Sandbox ระดับองค์กร</p>
              <h3 className="mt-2 text-lg font-semibold">
                รันไทม์แยกส่วน รองรับมากกว่า 40 ภาษา พร้อมโหมดเคอร์เนลที่ปลอดภัย
              </h3>
              <p className="mt-3 text-sm text-text-muted">
                ทีมพัฒนาชั้นนำไว้วางใจ เพื่อการประเมินผลที่ปลอดภัยและขยายระบบได้
              </p>
              <div className="mt-4 text-xs text-text-light">
                คะแนนเฉลี่ย 4.9 จากฟีดแบ็กคลัสเตอร์แบบเรียลไทม์
              </div>
            </div>
            <div className="w-full max-w-[320px] justify-self-start rounded-2xl border border-line bg-[#050b08] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.45)] md:col-span-2 md:justify-self-end">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-heart" />
                <span className="h-3 w-3 rounded-full bg-energy" />
                <span className="h-3 w-3 rounded-full bg-growth" />
              </div>
              <div className="font-mono text-sm leading-relaxed text-growth sm:text-base">
                <p>$ docker run codearea-v4</p>
                <p>&gt; กำลังเริ่มต้นเคอร์เนล...</p>
                <p>&gt; แยกเครือข่ายเรียบร้อย</p>
                <p>&gt; พร้อมใช้งาน</p>
              </div>
            </div>
          </article>
        </ScrollRevealSection>

        <ScrollRevealSection className="rounded-3xl p-1 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">โจทย์ยอดนิยม</h2>
            <Link
              href="/problems"
              className="text-sm font-semibold text-primary hover:text-primary-hover"
            >
              ดูโจทย์ทั้งหมด
            </Link>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {missions.map((mission) => {
              const difficultyColors = {
                HARD: "text-rose-300 border-rose-300/40 bg-rose-500/10",
                MEDIUM: "text-cyan-300 border-cyan-300/40 bg-cyan-500/10",
                EASY: "text-emerald-300 border-emerald-300/40 bg-emerald-500/10",
              };
              const difficultyLabels = {
                HARD: "ยาก",
                MEDIUM: "ปานกลาง",
                EASY: "ง่าย",
              };
              return (
                <div
                  key={mission.title}
                  className="surface-card group flex h-full flex-col overflow-hidden rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/45"
                >
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${difficultyColors[mission.difficulty]}`}
                      >
                        {difficultyLabels[mission.difficulty]}
                      </span>
                      <span className="rounded-full border border-line bg-soft px-3 py-1 text-xs text-text-muted">
                        โจทย์แนะนำ
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight text-foreground">
                      {mission.title}
                    </h3>
                    <p className="mt-3 min-h-12 text-sm leading-relaxed text-text-muted">
                      {mission.description ?? "ยังไม่มีคำอธิบายโจทย์"}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-energy/35 bg-energy/10 px-3 py-1 text-xs font-medium text-energy">
                        <Icon name="feature-2" className="h-3.5 w-3.5" />
                        <span>{mission.points} คะแนน</span>
                      </div>
                      <Link
                        href={`/problems/${mission.code}`}
                        className="text-xs font-semibold text-text-muted transition hover:text-primary"
                      >
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollRevealSection>

        {!isLoggedIn ? (
          <ScrollRevealSection className="surface-card rounded-3xl bg-linear-to-r from-primary/10 via-surface to-hint/10 p-8 py-12 text-center">
            <h2 className="text-2xl font-bold">
              พร้อมก้าวข้ามขีดจำกัดของคุณหรือยัง?
            </h2>
            <p className="mt-2 text-text-muted">
              เข้าร่วมกับนักพัฒนากว่า 10,000 คน ที่กำลังขยายขอบเขตความเป็นไปได้
            </p>
            <Link
              href="/register"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-[#07110d] shadow-[0_12px_30px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:bg-primary-hover"
            >
              สร้างบัญชีฟรี
            </Link>
          </ScrollRevealSection>
        ) : null}
      </div>
    </main>
  );
}
