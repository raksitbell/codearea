import { getSqlClient } from "@/server/db/client";

export async function leaderboard(page: number, limit: number) {
  const sql = getSqlClient();
  const rows = await sql<{ rank: number; user_id: number; display_name: string; email: string; total_point: number; solved_count: number }[]>`
    with point_totals as (
      select user_id, sum(points)::int total_point from points_ledger group by user_id
    ), solve_totals as (
      select user_id, count(distinct problem_id) filter (where status='accepted')::int solved_count
      from submissions group by user_id
    ), ranked as (
      select u.id as user_id, u.display_name, u.email,
        coalesce(pt.total_point, 0)::int as total_point,
        coalesce(st.solved_count, 0)::int as solved_count,
        rank() over (order by coalesce(pt.total_point, 0) desc, coalesce(st.solved_count, 0) desc, u.id)::int as rank
      from users u left join point_totals pt on pt.user_id = u.id
      left join solve_totals st on st.user_id = u.id
      where u.active = true
    ) select * from ranked where rank <= 100 order by rank
  `;
  const podium = rows.filter((row) => row.rank <= 3);
  const tableRows = rows.filter((row) => row.rank > 3).slice((page - 1) * limit, page * limit);
  const total = rows.filter((row) => row.rank > 3).length;
  return { podium, table: { data: tableRows, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } }, meta: { leaderboard_cap: 100, podium_ranks: "1–3", table_ranks: "4–100" } };
}

export async function dashboardSummary() {
  const sql = getSqlClient();
  const [counts] = await sql<{ users_total: number; admins_total: number; questions_total: number; test_cases_total: number }[]>`
    select (select count(*)::int from users where active) users_total,
      (select count(*)::int from users u join roles r on r.id=u.role_id where u.active and r.name='admin') admins_total,
      (select count(*)::int from problems where state='published') questions_total,
      (select count(*)::int from test_cases tc join problem_revisions pr on pr.id=tc.revision_id join problems p on p.id=pr.problem_id and p.published_revision=pr.revision) test_cases_total
  `;
  const top = await sql<{ question_id: string; code: string; title: string; submission_count: number }[]>`
    select p.id question_id, p.slug code, pr.title, count(s.id)::int submission_count
    from problems p join problem_revisions pr on pr.problem_id=p.id and pr.revision=p.published_revision
    left join submissions s on s.problem_id=p.id group by p.id, pr.title order by count(s.id) desc limit 5
  `;
  const [completion] = await sql<{ successful: number; unsuccessful: number }[]>`
    select count(*) filter (where status='accepted')::int successful,
      count(*) filter (where status<>'accepted')::int unsuccessful from submissions
  `;
  const recent = await sql`
    select u.id user_id, u.display_name, u.email, max(s.created_at) last_submission_at,
      count(s.id)::int total_attempt,
      count(s.id) filter (where s.status='accepted')::int total_finished
    from users u join submissions s on s.user_id=u.id group by u.id order by max(s.created_at) desc limit 5
  `;
  return { ...counts, completion_comparison: { labels: ["Accepted", "Not accepted"], successful_submissions: completion.successful, unsuccessful_submissions: completion.unsuccessful, values: [completion.successful, completion.unsuccessful] }, recent_user_activity: recent, top_questions: top };
}

export async function dashboardProblemStats(options: { search?: string; startDate?: string; endDate?: string }) {
  const sql = getSqlClient();
  const search = options.search?.trim() ?? "";
  const startDate = options.startDate || null;
  const endDate = options.endDate || null;
  return sql`
    select p.id "problemId", p.slug code, pr.title, pr.difficulty::text difficulty,
      count(s.id) filter (where s.status<>'accepted')::int "notDoneCount",
      count(s.id) filter (where s.status='accepted')::int "doneCount",
      count(s.id)::int total
    from problems p join problem_revisions pr on pr.problem_id=p.id and pr.revision=p.published_revision
    left join submissions s on s.problem_id=p.id
      and (${startDate}::timestamptz is null or s.created_at >= ${startDate}::timestamptz)
      and (${endDate}::timestamptz is null or s.created_at <= ${endDate}::timestamptz)
    where (${search}='' or p.slug ilike ${`%${search}%`} or pr.title ilike ${`%${search}%`})
    group by p.id, pr.title, pr.difficulty order by count(s.id) desc
  `;
}

export async function dashboardCategoryStats(options: { categoryId?: number; startDate?: string; endDate?: string }) {
  const sql = getSqlClient();
  const categoryId = options.categoryId ?? null;
  const startDate = options.startDate || null;
  const endDate = options.endDate || null;
  return sql`
    select c.id "categoryId", c.name "categoryName", count(distinct p.id)::int "questionCount",
      count(s.id) filter (where s.status<>'accepted')::int "notDoneCount",
      count(s.id) filter (where s.status='accepted')::int "doneCount",
      count(s.id)::int total
    from categories c left join problem_revisions pr on pr.category_id=c.id
    left join problems p on p.id=pr.problem_id and p.published_revision=pr.revision
    left join submissions s on s.problem_id=p.id
      and (${startDate}::timestamptz is null or s.created_at >= ${startDate}::timestamptz)
      and (${endDate}::timestamptz is null or s.created_at <= ${endDate}::timestamptz)
    where c.active and (${categoryId}::int is null or c.id=${categoryId}::int)
    group by c.id order by c.name
  `;
}

export async function problemReport(page: number, limit: number) {
  const sql = getSqlClient();
  const rows = await sql`
    select p.id question_id, p.slug code, pr.title, pr.difficulty::text,
      count(s.id)::int total_attempt,
      count(s.id) filter (where s.status='accepted')::int total_finished,
      count(s.id) filter (where s.status<>'accepted')::int total_unfinished
    from problems p join problem_revisions pr on pr.problem_id=p.id and pr.revision=p.published_revision
    left join submissions s on s.problem_id=p.id group by p.id, pr.title, pr.difficulty order by p.slug
  `;
  return { data: rows.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: rows.length, total_pages: Math.ceil(rows.length / limit), totalPages: Math.ceil(rows.length / limit) } };
}

export async function categoryReport(page: number, limit: number) {
  const sql = getSqlClient();
  const rows = await sql`
    select c.id category_id, c.name category, c.name category_name,
      count(distinct p.id)::int question_count, count(s.id)::int total_attempt,
      count(s.id) filter (where s.status='accepted')::int total_finished,
      count(s.id) filter (where s.status<>'accepted')::int total_unfinished
    from categories c left join problem_revisions pr on pr.category_id=c.id
    left join problems p on p.id=pr.problem_id and p.published_revision=pr.revision
    left join submissions s on s.problem_id=p.id where c.active group by c.id order by c.name
  `;
  return { data: rows.slice((page - 1) * limit, page * limit), pagination: { page, limit, total: rows.length, total_pages: Math.ceil(rows.length / limit), totalPages: Math.ceil(rows.length / limit) } };
}

export async function userActivityReport(options: { page: number; limit: number; search?: string; startDate?: string; endDate?: string }) {
  const sql = getSqlClient();
  const search = options.search?.trim() ?? "";
  const startDate = options.startDate || null;
  const endDate = options.endDate || null;
  const rows = await sql<{ user_id: number; display_name: string; email: string; total_attempt: number; total_finished: number; total_unfinished: number; avg_submit_per_question: number }[]>`
    select u.id user_id, u.display_name, u.email,
      count(s.id)::int total_attempt,
      count(s.id) filter (where s.status='accepted')::int total_finished,
      count(s.id) filter (where s.status<>'accepted')::int total_unfinished,
      coalesce(round(count(s.id)::numeric / nullif(count(distinct s.problem_id), 0), 2), 0)::float avg_submit_per_question
    from users u
    left join submissions s on s.user_id=u.id
      and (${startDate}::timestamptz is null or s.created_at >= ${startDate}::timestamptz)
      and (${endDate}::timestamptz is null or s.created_at <= ${endDate}::timestamptz)
    where (${search} = '' or u.display_name ilike ${`%${search}%`} or u.email ilike ${`%${search}%`})
    group by u.id order by count(s.id) desc, u.id
  `;
  const total = rows.length;
  return { data: rows.slice((options.page - 1) * options.limit, options.page * options.limit), pagination: { page: options.page, limit: options.limit, total, total_pages: Math.ceil(total / options.limit), totalPages: Math.ceil(total / options.limit) } };
}

export async function profileSummary(userId: number) {
  const sql = getSqlClient();
  const [stats] = await sql<{ total_submissions: number; passed_count: number; solved_count: number; xp: number }[]>`
    select count(s.id)::int total_submissions, count(s.id) filter (where s.status='accepted')::int passed_count,
      count(distinct s.problem_id) filter (where s.status='accepted')::int solved_count,
      coalesce((select sum(points)::int from points_ledger where user_id=${userId}),0) xp
    from submissions s where s.user_id=${userId}
  `;
  const recent = await sql`select s.id, s.language, s.status, s.created_at, p.slug code, pr.title from submissions s join problems p on p.id=s.problem_id join problem_revisions pr on pr.id=s.revision_id where s.user_id=${userId} order by s.created_at desc limit 10`;
  const solved = await sql`select distinct on (p.id) p.id, p.slug code, pr.title, pr.difficulty, c.name category_name from submissions s join problems p on p.id=s.problem_id join problem_revisions pr on pr.id=s.revision_id left join categories c on c.id=pr.category_id where s.user_id=${userId} and s.status='accepted' order by p.id, s.created_at desc`;
  const total = stats?.total_submissions ?? 0;
  const passed = stats?.passed_count ?? 0;
  return { user: { ...stats, failed_count: total - passed, accuracy: total ? Math.round((passed / total) * 100) : 0, avatar_url: null, bio: "", location: "" }, recent_activity: recent, category_stats: [], tag_stats: [], solved_questions: solved };
}
