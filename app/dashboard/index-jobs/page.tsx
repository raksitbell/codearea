"use client";

import { DashboardErrorState } from "@/components/dashboard/DashboardErrorState";
import { DashboardLoadingState } from "@/components/dashboard/DashboardLoadingState";
import { DashboardPanelHeader } from "@/components/dashboard/DashboardPanelHeader";
import {
  DashboardTableBody,
  DashboardTableContainer,
  DashboardTableHead,
  DashboardTd,
  DashboardTh,
  DashboardTr,
} from "@/components/dashboard/DashboardTable";
import type {
  IndexJobRow,
  IndexJobState,
  IndexJobsSummary,
} from "@/components/dashboard/types";
import Header from "@/components/Header";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";

// สถานะงาน index — สอดคล้องกับ enum `index_job_state` ใน server/db/schema.ts
const stateLabels: Record<IndexJobState, string> = {
  pending: "รอคิว",
  running: "กำลังทำงาน",
  retry: "รอลองใหม่",
  complete: "สำเร็จ",
  failed: "ล้มเหลว",
  stale: "ค้าง",
};

const stateBadgeClass: Record<IndexJobState, string> = {
  pending: "bg-muted/10 text-muted",
  running: "bg-primary/10 text-primary",
  retry: "bg-warning/10 text-warning",
  complete: "bg-secondary/10 text-secondary",
  failed: "bg-danger/10 text-danger",
  stale: "bg-warning/10 text-warning",
};

const stateFilters: Array<{ value: string; label: string }> = [
  { value: "", label: "ทุกสถานะ" },
  { value: "pending", label: stateLabels.pending },
  { value: "running", label: stateLabels.running },
  { value: "retry", label: stateLabels.retry },
  { value: "complete", label: stateLabels.complete },
  { value: "failed", label: stateLabels.failed },
  { value: "stale", label: stateLabels.stale },
];

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function IndexJobsPage() {
  const [summary, setSummary] = useState<IndexJobsSummary | null>(null);
  const [rows, setRows] = useState<IndexJobRow[]>([]);
  const [stateFilter, setStateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    const res = await api.get<IndexJobsSummary>("/dashboard/index-jobs/summary", {
      useToken: true,
    });
    if (res.ok && res.data) setSummary(res.data);
  }, []);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await api.get<{
      data: IndexJobRow[];
      pagination: { total_pages?: number; totalPages?: number };
    }>("/dashboard/index-jobs", {
      useToken: true,
      params: { state: stateFilter || undefined, page, limit: 20 },
    });
    if (!res.ok || !res.data) {
      setError(res.error ?? "โหลดข้อมูลงาน index ไม่สำเร็จ");
      setRows([]);
      setLoading(false);
      return;
    }
    setRows(res.data.data ?? []);
    setTotalPages(
      res.data.pagination?.total_pages ?? res.data.pagination?.totalPages ?? 1,
    );
    setLoading(false);
  }, [stateFilter, page]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const summaryCards = useMemo(() => {
    if (!summary) return [];
    return [
      {
        label: "งานทั้งหมด",
        value: summary.total,
        accentBar: "bg-foreground",
        metaClass: "text-muted",
      },
      {
        label: stateLabels.running,
        value: summary.counts.running,
        accentBar: "bg-primary",
        metaClass: "text-primary",
      },
      {
        label: stateLabels.retry,
        value: summary.counts.retry,
        accentBar: "bg-warning",
        metaClass: "text-warning",
      },
      {
        label: stateLabels.complete,
        value: summary.counts.complete,
        accentBar: "bg-secondary",
        metaClass: "text-secondary",
      },
      {
        label: `${stateLabels.failed} / ${stateLabels.stale}`,
        value: summary.counts.failed + summary.counts.stale,
        accentBar: "bg-danger",
        metaClass: "text-danger",
      },
    ];
  }, [summary]);

  return (
    <>
      <Header title="งาน Index" icon={<Icon name="cpu" className="h-5 w-5" />} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 overflow-y-auto px-5 py-8 sm:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
            Index Jobs
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            งานสร้าง AI Index
          </h2>
          <p className="mt-2 text-sm text-muted">
            ติดตามคิวงาน embedding ของ Problem Revision ที่เผยแพร่แล้ว
          </p>
        </div>

        {summary ? (
          <section className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              System
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                summary.system_state === "healthy"
                  ? "bg-secondary/10 text-secondary"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {summary.system_state === "healthy" ? "ปกติ" : "ต้องตรวจสอบ"}
            </span>
            <span className="ml-4 text-xs font-semibold uppercase tracking-wider text-muted">
              Worker
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                summary.worker_state === "processing"
                  ? "bg-primary/10 text-primary"
                  : summary.worker_state === "waiting"
                    ? "bg-warning/10 text-warning"
                    : "bg-muted/10 text-muted"
              }`}
            >
              {summary.worker_state === "processing"
                ? "กำลังประมวลผล"
                : summary.worker_state === "waiting"
                  ? "รอดำเนินการ"
                  : "ว่าง"}
            </span>
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
            >
              <span
                aria-hidden
                className={`absolute inset-x-0 top-0 h-1 ${card.accentBar}`}
              />
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
                  {card.value.toLocaleString("th-TH")}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <DashboardPanelHeader
              title="รายการงาน Index"
              subtitle="เรียงจากล่าสุด"
            />
            <div className="relative min-w-[180px]">
              <select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none rounded-xl border border-border bg-surface-elevated/50 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                {stateFilters.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <DashboardLoadingState />
          ) : error ? (
            <DashboardErrorState message={error} onRetry={() => void loadJobs()} />
          ) : (
            <>
              <DashboardTableContainer>
                <DashboardTableHead>
                  <DashboardTh>สถานะ</DashboardTh>
                  <DashboardTh>โจทย์</DashboardTh>
                  <DashboardTh className="text-right">ครั้งที่พยายาม</DashboardTh>
                  <DashboardTh>พร้อมทำงาน</DashboardTh>
                  <DashboardTh>เสร็จสิ้น</DashboardTh>
                  <DashboardTh>ข้อผิดพลาด</DashboardTh>
                </DashboardTableHead>
                <DashboardTableBody>
                  {rows.map((row) => (
                    <DashboardTr key={row.id}>
                      <DashboardTd>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${stateBadgeClass[row.state]}`}
                        >
                          {stateLabels[row.state]}
                        </span>
                      </DashboardTd>
                      <DashboardTd className="text-foreground">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-muted">
                            {row.code}
                          </span>
                          <span>{row.title}</span>
                        </div>
                      </DashboardTd>
                      <DashboardTd className="text-right tabular-nums text-foreground">
                        {row.attempts}
                      </DashboardTd>
                      <DashboardTd className="text-muted">
                        {formatDateTime(row.available_at)}
                      </DashboardTd>
                      <DashboardTd className="text-muted">
                        {formatDateTime(row.completed_at)}
                      </DashboardTd>
                      <DashboardTd className="max-w-xs truncate text-danger">
                        {row.error ?? "-"}
                      </DashboardTd>
                    </DashboardTr>
                  ))}
                  {rows.length === 0 && (
                    <DashboardTr>
                      <DashboardTd colSpan={6} className="py-8 text-center text-muted">
                        ไม่มีงาน index
                      </DashboardTd>
                    </DashboardTr>
                  )}
                </DashboardTableBody>
              </DashboardTableContainer>

              {totalPages > 1 ? (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-40"
                  >
                    ก่อนหน้า
                  </button>
                  <span className="text-xs text-muted">
                    หน้า {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-40"
                  >
                    ถัดไป
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </main>
    </>
  );
}
