"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Progress = {
  totalPoints: number;
  streak: { currentDays: number; longestDays: number };
  achievements: { key: string; title: string; description: string; icon: string; earnedAt: string | null }[];
};

export function AchievementsList() {
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => { void api.get<Progress>("/profile-progress", { useToken: true }).then((response) => { if (response.ok && response.data) setProgress(response.data); }); }, []);
  if (!progress) return <div className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5" />;
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-white">Achievements</h3>
          <p className="text-xs text-white/40">รางวัลคำนวณจาก accepted submissions แบบ idempotent</p>
        </div>
        <div className="flex gap-2 text-xs font-bold">
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-300">{progress.totalPoints} pts</span>
          <span className="rounded-full bg-orange-500/10 px-3 py-1 text-orange-300">🔥 {progress.streak.currentDays} วัน</span>
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-violet-300">สูงสุด {progress.streak.longestDays}</span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {progress.achievements.map((achievement) => (
          <article key={achievement.key} className={`rounded-xl border p-4 ${achievement.earnedAt ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/[0.02] opacity-45"}`}>
            <div className="flex gap-3">
              <span className="text-2xl" aria-hidden>{achievement.icon}</span>
              <div><h4 className="text-sm font-bold text-white">{achievement.title}</h4><p className="mt-1 text-xs text-white/50">{achievement.description}</p></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
