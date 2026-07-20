import { and, countDistinct, eq, sql } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { achievementDefinitions, earnedAchievements, pointsLedger, submissions, userStreaks } from "@/server/db/schema";
import { getConfig } from "@/server/config";

export function localDay(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: getConfig().APP_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" });
  return formatter.format(date);
}

export function dayDifference(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

export async function recordAcceptedProgress(userId: number, submissionId: number, points: number) {
  const db = getDb();
  const [submission] = await db.select({ problemId: submissions.problemId }).from(submissions).where(and(eq(submissions.id, submissionId), eq(submissions.userId, userId))).limit(1);
  if (!submission) throw new Error("Accepted submission not found");
  await db.insert(pointsLedger).values({ userId, problemId: submission.problemId, submissionId, reason: "first_accept", points }).onConflictDoNothing();
  const [{ solves, languages }] = await db.select({
    solves: countDistinct(submissions.problemId),
    languages: countDistinct(submissions.language),
  }).from(submissions).where(and(eq(submissions.userId, userId), eq(submissions.status, "accepted")));
  const today = localDay(new Date());
  const [streak] = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1);
  let current = streak?.currentDays ?? 0;
  let longest = streak?.longestDays ?? 0;
  if (!streak?.lastActiveDay) current = 1;
  else if (streak.lastActiveDay !== today) current = dayDifference(streak.lastActiveDay, today) === 1 ? current + 1 : 1;
  longest = Math.max(longest, current);
  await db.insert(userStreaks).values({ userId, currentDays: current, longestDays: longest, lastActiveDay: today }).onConflictDoUpdate({ target: userStreaks.userId, set: { currentDays: current, longestDays: longest, lastActiveDay: today, updatedAt: new Date() } });
  const earned: string[] = [];
  if (Number(solves) >= 1) earned.push("first-solve");
  if (Number(solves) >= 10) earned.push("ten-solves");
  if (Number(languages) >= 3) earned.push("polyglot-3");
  if (current >= 3) earned.push("streak-3");
  if (current >= 7) earned.push("streak-7");
  if (earned.length) await db.insert(earnedAchievements).values(earned.map((achievementKey) => ({ userId, achievementKey, submissionId }))).onConflictDoNothing();
  return { solves: Number(solves), languages: Number(languages), streak: { currentDays: current, longestDays: longest }, earned };
}

export async function getProgress(userId: number) {
  const [streak] = await getDb().select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1);
  const achievements = await getDb().select({ key: achievementDefinitions.key, title: achievementDefinitions.title, description: achievementDefinitions.description, icon: achievementDefinitions.icon, earnedAt: earnedAchievements.earnedAt }).from(achievementDefinitions).leftJoin(earnedAchievements, and(eq(earnedAchievements.achievementKey, achievementDefinitions.key), eq(earnedAchievements.userId, userId))).orderBy(achievementDefinitions.sortOrder);
  const [{ totalPoints }] = await getDb().select({ totalPoints: sql<number>`coalesce(sum(${pointsLedger.points}), 0)::int` }).from(pointsLedger).where(eq(pointsLedger.userId, userId));
  return { achievements, streak: streak ?? { currentDays: 0, longestDays: 0, lastActiveDay: null }, totalPoints };
}

export async function achievementCatalog() {
  return getDb().select().from(achievementDefinitions).orderBy(achievementDefinitions.sortOrder);
}
