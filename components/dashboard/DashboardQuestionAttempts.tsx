// Dashboard Question Attempts Component
// คอมโพเนนต์แสดงสถิติการส่งแยกตามรายโจทย์ (Questions)
// 1. แสดงรายการโจทย์พร้อมสถิติรายข้อ
// 2. ค้นหาโจทย์ตามไอดี หรือชื่อโจทย์
// 3. กรองข้อมูลตามช่วงวันที่

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardPanelHeader } from "./DashboardPanelHeader";
import type { QuestionStat } from "./types";
import {
  DashboardTableBody,
  DashboardTableContainer,
  DashboardTableHead,
  DashboardTd,
  DashboardTh,
  DashboardTr,
} from "./DashboardTable";
import { Icon } from "@/components/icons/Icon";

export function DashboardQuestionAttempts() {
  const [data, setData] = useState<QuestionStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  // Search Debouncer
  // หน่วงเวลาการค้นหาเพื่อให้ API ไม่ถูกเรียกถี่เกินไปขณะพิมพ์
  // 1. ใช้ useEffect ติดตามค่า search
  // 2. ตั้งเวลา 400ms ก่อนอัปเดต debouncedSearch
  // 3. ล้าง Timer เก่าทิ้งหากมีการพิมพ์ใหม่
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // calculateDates
  // คำนวณวันที่ตาม Preset (Last Week, Last Month, All)
  const calculateDates = useCallback((preset: string) => {
    const now = new Date();
    let start = "";
    let end = "";

    if (preset === "last_week") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split("T")[0];
      end = now.toISOString().split("T")[0];
    } else if (preset === "last_month") {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      start = d.toISOString().split("T")[0];
      end = now.toISOString().split("T")[0];
    } else if (preset === "all") {
      start = "";
      end = "";
    }

    return { start, end };
  }, []);

  // handlePresetChange
  // จัดการเมื่อมีการเลือก Preset วันที่ใหม่
  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    if (preset !== "custom") {
      const { start, end } = calculateDates(preset);
      setStartDate(start);
      setEndDate(end);
    }
  };

  // loadData
  // ดึงข้อมูลสถิติการรันโค้ดรายข้อจาก Backend
  // 1. เตรียม Query (startDate, endDate, debouncedSearch)
  // 2. เรียก API /dashboard/problem-stats
  // 3. บันทึกข้อมูลที่ได้รับลงใน state data
  // Security: ตรวจสอบ Admin Access ผ่าน useToken
  const loadData = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);
    if (debouncedSearch) query.append("search", debouncedSearch);

    const res = await api.get<QuestionStat[]>(
      `/dashboard/problem-stats?${query.toString()}`,
      { useToken: true },
    );
    if (res.ok && res.data) {
      setData(res.data);
    }
    setLoading(false);
  }, [startDate, endDate, debouncedSearch]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface p-6 pb-2 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <DashboardPanelHeader
          title="สถิติการส่งตามโจทย์"
          subtitle="Dashboard Question Attempts"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group min-w-[160px]">
            <Icon
              name="calendar"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors"
            />
            <select
              value={datePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-surface-elevated/50 pl-9 pr-10 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            >
              <option value="all">ทั้งหมด (All Time)</option>
              <option value="last_week">สัปดาห์ที่แล้ว</option>
              <option value="last_month">เดือนที่แล้ว</option>
              <option value="custom">กำหนดเอง (Custom)</option>
            </select>
            <Icon
              name="chevron-down"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted transition-transform group-focus-within:rotate-180"
            />
          </div>

          {datePreset === "custom" && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated/50 p-1 px-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[130px] bg-transparent px-2 py-1 text-sm text-foreground focus:outline-none sm:w-auto"
              />
              <span className="text-muted">/</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[130px] bg-transparent px-2 py-1 text-sm text-foreground focus:outline-none sm:w-auto"
              />
            </div>
          )}

          <div className="relative group min-w-[240px]">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-primary transition-colors"
            />
            <input
              type="text"
              placeholder="ค้นหาไอดี หรือชื่อโจทย์..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated/50 pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>
      <DashboardTableContainer className="max-h-[500px]">
        <DashboardTableHead>
          <DashboardTh>ไอดี</DashboardTh>
          <DashboardTh>ชื่อโจทย์</DashboardTh>
          <DashboardTh className="text-right text-warning">
            ยังไม่เสร็จ
          </DashboardTh>
          <DashboardTh className="text-right text-secondary">
            เสร็จสิ้น
          </DashboardTh>
          <DashboardTh className="text-right text-foreground">รวมส่ง</DashboardTh>
        </DashboardTableHead>
        <DashboardTableBody className={loading ? "opacity-50" : ""}>
          {data.map((row) => (
            <DashboardTr key={row.questionId}>
              <DashboardTd className="font-mono text-xs text-muted">
                {row.questionId}
              </DashboardTd>
              <DashboardTd className="font-medium text-foreground">
                <div className="flex flex-col">
                  <span>{row.title}</span>
                  <span className="text-xs text-muted">{row.code}</span>
                </div>
              </DashboardTd>
              <DashboardTd className="text-right font-medium tabular-nums text-warning">
                {row.notDoneCount.toLocaleString("th-TH")}
              </DashboardTd>
              <DashboardTd className="text-right font-medium tabular-nums text-secondary">
                {row.doneCount.toLocaleString("th-TH")}
              </DashboardTd>
              <DashboardTd className="text-right font-medium tabular-nums text-foreground">
                {row.total.toLocaleString("th-TH")}
              </DashboardTd>
            </DashboardTr>
          ))}
          {data.length === 0 && !loading && (
            <DashboardTr>
              <DashboardTd
                colSpan={5}
                className="py-8 text-center text-muted"
              >
                ไม่มีข้อมูล
              </DashboardTd>
            </DashboardTr>
          )}
        </DashboardTableBody>
      </DashboardTableContainer>
    </section>
  );
}
