// Dashboard Type Definitions

export type DashboardPayload = {
  test_cases_total: number;
  admins_total: number;
  questions_total: number;
  users_total: number;
  completion_comparison: {
    labels: string[];
    successful_submissions: number;
    unsuccessful_submissions: number;
    values: number[];
  };
  recent_user_activity: Array<{
    user_id: number;
    display_name: string;
    email: string;
    last_submission_at: string;
    total_attempt: number;
    total_finished: number;
    submissions_passed: number;
    submissions_not_passed: number;
  }>;
  top_questions: Array<{
    question_id: number;
    code: string;
    title: string;
    submission_count: number;
  }>;
};

export type DashboardSummaryCard = {
  label: string;
  hint: string;
  value: number;
  // Tailwind bg-* class for the colored accent bar across the card top,
  // matching the Admin01 KPI cards in the Penpot mockup.
  accentBar: string;
  // Tailwind text-* class for the small meta line beneath the value.
  metaClass: string;
};

export type PieRow = { name: string; value: number };

export type CategoryStat = {
  categoryId: number | null;
  categoryName: string;
  questionCount: number;
  notDoneCount: number;
  doneCount: number;
  total: number;
};

export type QuestionStat = {
  questionId: number;
  code: string;
  title: string;
  difficulty?: string | null;
  notDoneCount: number;
  doneCount: number;
  total: number;
};

export type UserActivityStat = {
  userId: number;
  displayName: string;
  email: string;
  totalAttempt: number;
  totalUnfinished: number;
  totalFinished: number;
  avgSubmitPerQuestion: number;
};

export type ReportPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type IndexJobState =
  | "pending"
  | "running"
  | "retry"
  | "complete"
  | "failed"
  | "stale";

export type IndexJobRow = {
  id: string;
  state: IndexJobState;
  attempts: number;
  available_at: string;
  locked_at: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
  code: string;
  title: string;
};

export type IndexJobsSummary = {
  counts: Record<IndexJobState, number>;
  total: number;
  system_state: "healthy" | "attention";
  worker_state: "processing" | "waiting" | "idle";
};
