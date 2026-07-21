import { eq } from "drizzle-orm";
import { closeDb, getDb } from "@/server/db/client";
import { achievementDefinitions, categories, roles, users } from "@/server/db/schema";

async function main() {
const db = getDb();
await db.insert(roles).values([{ name: "learner" }, { name: "admin" }]).onConflictDoNothing();
await db.insert(achievementDefinitions).values([
  { key: "first-solve", title: "First Solve", description: "แก้ Problem แรกสำเร็จ", icon: "🌱", criterion: { distinctProblems: 1 }, sortOrder: 10 },
  { key: "ten-solves", title: "Problem Solver", description: "แก้ Problem ที่แตกต่างกัน 10 ข้อ", icon: "🏆", criterion: { distinctProblems: 10 }, sortOrder: 20 },
  { key: "polyglot-3", title: "Polyglot", description: "ผ่าน Problem ด้วย 3 ภาษา", icon: "🧩", criterion: { distinctLanguages: 3 }, sortOrder: 30 },
  { key: "streak-3", title: "On Fire", description: "รักษาสตรีค 3 วัน", icon: "🔥", criterion: { streakDays: 3 }, sortOrder: 40 },
  { key: "streak-7", title: "Weekly Discipline", description: "รักษาสตรีค 7 วัน", icon: "⚡", criterion: { streakDays: 7 }, sortOrder: 50 },
]).onConflictDoNothing();
await db.insert(categories).values([{ name: "Algorithms", description: "Problems ด้านอัลกอริทึม" }, { name: "Data Structures", description: "Problems ด้านโครงสร้างข้อมูล" }]).onConflictDoNothing();

const adminEmail = process.env.ADMIN_EMAIL;
if (adminEmail) {
  const [adminRole] = await db.select().from(roles).where(eq(roles.name, "admin")).limit(1);
  await db.update(users).set({ roleId: adminRole.id, updatedAt: new Date() }).where(eq(users.email, adminEmail.trim().toLowerCase()));
}
await closeDb();
}

main().catch(async (error) => {
  console.error(error);
  await closeDb();
  process.exitCode = 1;
});
