"use client";

import {
  ThemedAsyncMultiSelect2,
  ThemedAsyncSelect2,
  ThemedInput,
  ThemedSelect,
  type Select2Option,
} from "@/components/FormControls";
import { MarkdownCodeEditor } from "@/components/editor/MarkdownCodeEditor";
import { Icon } from "@/components/icons/Icon";
import { UnsavedChangesBar } from "@/components/UnsavedChangesBar";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  loadQuestionCategoryOptionsForForm,
  loadTagOptionsForForm,
} from "@/lib/questionTaxonomyApi";
import CodeEditor from "../editor/CodeEditor";

type ProblemDetailResponse = {
  category_id?: string | number | null;
  categoryId?: string | number | null;
  code: string;
  title: string;
  category_name?: string | null;
  description?: string | null;
  constraints?: string | null;
  solution?: string | null;
  difficulty?: string | number | null;
  expected_complexity?: string | null;
  time_limit?: number | null;
  memory_limit?: number | null;
  points?: number | null;
  status?: boolean | null;
  tags?: unknown[];
  test_cases?: {
    id?: number;
    input_data: string;
    output_data: string;
    case_order?: number | null;
    is_simple?: boolean;
    status?: boolean;
  }[];
};

type ProblemUpsertFormProps = {
  code?: string;
};

type ProblemFormState = {
  category_id: string;
  title: string;
  description: string;
  constraints: string;
  solution: string;
  difficulty: string;
  expected_complexity: string;
  time_limit: string;
  memory_limit: string;
  points: string;
  status: "1" | "0";
  tag: string[];
  test_cases: {
    id?: number;
    input_data: string;
    output_data: string;
    case_order: string;
    is_simple: boolean;
    status: boolean;
  }[];
};

const initialFormState: ProblemFormState = {
  category_id: "",
  title: "",
  description: "",
  constraints: "",
  solution: "",
  difficulty: "",
  expected_complexity: "",
  time_limit: "",
  memory_limit: "",
  points: "",
  status: "1",
  tag: [],
  test_cases: [
    {
      input_data: "",
      output_data: "",
      case_order: "1",
      is_simple: false,
      status: true,
    },
  ],
};

const expectedComplexityOptions = [
  "O(1)",
  "O(log N)",
  "O(sqrt N)",
  "O(N)",
  "O(N log N)",
  "O(N^2)",
  "O(N^3)",
  "O(2^N)",
  "O(N!)",
];

function categoryIdFromDetail(data: ProblemDetailResponse): string {
  const rawId = data.category_id ?? data.categoryId;
  if (rawId === null || rawId === undefined) return "";
  return String(rawId).trim();
}

function normalizeTagValue(item: unknown): string {
  if (item === null || item === undefined) return "";
  if (typeof item === "string" || typeof item === "number") {
    return String(item).trim();
  }
  if (typeof item === "object" && "name" in (item as object)) {
    const n = (item as { name: unknown }).name;
    if (n !== null && n !== undefined) return String(n).trim();
  }
  if (typeof item === "object" && "slug" in (item as object)) {
    const s = (item as { slug: unknown }).slug;
    if (s !== null && s !== undefined) return String(s).trim();
  }
  return "";
}

export function ProblemUpsertForm({ code }: ProblemUpsertFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(code);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProblemFormState>(initialFormState);
  const [lastSavedData, setLastSavedData] = useState<string>("");
  const [categoryOption, setCategoryOption] = useState<Select2Option | null>(
    null,
  );
  const isDirty = useMemo(() => {
    return Boolean(lastSavedData && JSON.stringify(formData) !== lastSavedData);
  }, [formData, lastSavedData]);

  useEffect(() => {
    // Initial lastSavedData for "New" mode
    if (!code) {
      setLastSavedData(JSON.stringify(initialFormState));
    }
  }, [code]);

  useEffect(() => {
    if (!code) return;
    const run = async () => {
      setIsLoading(true);
      const res = await api.get<ProblemDetailResponse>(
        `/problems/${encodeURIComponent(code)}`,
        { useToken: true },
      );

      if (!res.ok || !res.data) {
        await Swal.fire({
          icon: "error",
          title: "โหลดข้อมูลไม่สำเร็จ",
          text: res.error ?? "ไม่พบข้อมูลโจทย์",
        });
        router.push("/dashboard/problems");
        return;
      }

      const data = res.data;
      const mappedTagValues = (data.tags ?? [])
        .map((item) => normalizeTagValue(item))
        .filter(Boolean);
      const cid = categoryIdFromDetail(data);
      const mappedTestCases =
        data.test_cases?.map((item, index) => ({
          id: item.id,
          input_data: item.input_data ?? "",
          output_data: item.output_data ?? "",
          case_order:
            item.case_order === null || item.case_order === undefined
              ? String(index + 1)
              : String(item.case_order),
          is_simple: Boolean(item.is_simple),
          status: item.status !== false,
        })) ?? initialFormState.test_cases;
      setCategoryOption(
        cid
          ? {
              value: cid,
              label: (data.category_name ?? cid).toString().trim() || cid,
            }
          : null,
      );
      setFormData({
        category_id: cid,
        title: data.title ?? "",
        description: data.description ?? "",
        constraints: data.constraints ?? "",
        solution: data.solution ?? "",
        difficulty:
          data.difficulty === null || data.difficulty === undefined
            ? ""
            : String(data.difficulty),
        expected_complexity: data.expected_complexity ?? "",
        time_limit:
          data.time_limit === null || data.time_limit === undefined
            ? ""
            : String(data.time_limit),
        memory_limit:
          data.memory_limit === null || data.memory_limit === undefined
            ? ""
            : String(data.memory_limit),
        points:
          data.points === null || data.points === undefined
            ? ""
            : String(data.points),
        status: data.status === false ? "0" : "1",
        tag: mappedTagValues,
        test_cases: mappedTestCases,
      });
      const stringified = JSON.stringify({
        category_id: cid,
        title: data.title ?? "",
        description: data.description ?? "",
        constraints: data.constraints ?? "",
        solution: data.solution ?? "",
        difficulty:
          data.difficulty === null || data.difficulty === undefined
            ? ""
            : String(data.difficulty),
        expected_complexity: data.expected_complexity ?? "",
        time_limit:
          data.time_limit === null || data.time_limit === undefined
            ? ""
            : String(data.time_limit),
        memory_limit:
          data.memory_limit === null || data.memory_limit === undefined
            ? ""
            : String(data.memory_limit),
        points:
          data.points === null || data.points === undefined
            ? ""
            : String(data.points),
        status: data.status === false ? "0" : "1",
        tag: mappedTagValues,
        test_cases: mappedTestCases,
      });
      setLastSavedData(stringified);
      setIsLoading(false);
    };
    void run();
  }, [code, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const tagSelections = useMemo(
    () => formData.tag.map((t) => ({ value: t, label: t })),
    [formData.tag],
  );

  const addTestCase = () => {
    setFormData((prev) => ({
      ...prev,
      test_cases: [
        ...prev.test_cases,
        {
          input_data: "",
          output_data: "",
          case_order: String(prev.test_cases.length + 1),
          is_simple: false,
          status: true,
        },
      ],
    }));
  };

  const removeTestCase = (index: number) => {
    setFormData((prev) => {
      if (prev.test_cases.length <= 1) return prev;
      const next = prev.test_cases.filter((_, idx) => idx !== index);
      return {
        ...prev,
        test_cases: next.map((item, idx) => ({
          ...item,
          case_order: item.case_order || String(idx + 1),
        })),
      };
    });
  };

  const updateTestCase = (
    index: number,
    field: "input_data" | "output_data" | "case_order" | "is_simple" | "status",
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      test_cases: prev.test_cases.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleSubmit = async (e?: React.FormEvent, publish = false) => {
    if (e) e.preventDefault();
    if (!formData.category_id.trim() || !formData.title.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณาระบุ category_id และ title",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const jsonPayload = {
        category_id: formData.category_id.trim(),
        title: formData.title.trim(),
        description: formData.description || null,
        constraints: formData.constraints || null,
        solution: formData.solution || null,
        difficulty: formData.difficulty || null,
        expected_complexity: formData.expected_complexity || null,
        time_limit: formData.time_limit ? Number(formData.time_limit) : null,
        memory_limit: formData.memory_limit
          ? Number(formData.memory_limit)
          : null,
        points: (() => {
          const raw = formData.points.trim();
          if (!raw) return null;
          const n = Number(raw);
          return Number.isFinite(n) ? n : null;
        })(),
        status: formData.status === "1",
        tag: formData.tag,
        test_cases: formData.test_cases
          .filter((item) => item.input_data.trim() && item.output_data.trim())
          .map((item) => ({
            ...(item.id ? { id: item.id } : {}),
            input_data: item.input_data,
            output_data: item.output_data,
            case_order: item.case_order ? Number(item.case_order) : null,
            is_simple: item.is_simple,
            status: item.status,
          })),
      };
      const res = isEditMode
        ? await api.put<{ message?: string; code?: string }>(
            `/problems/${encodeURIComponent(code ?? "")}`,
            jsonPayload,
            { useToken: true },
          )
        : await api.post<{ message?: string; code?: string }>(
            "/problems",
            jsonPayload,
            { useToken: true },
          );

      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: isEditMode ? "อัปเดตไม่สำเร็จ" : "สร้างไม่สำเร็จ",
          text: res.error ?? "เกิดข้อผิดพลาดจากระบบ",
        });
        return;
      }

      const targetSlug = code ?? res.data?.code;
      if (publish && targetSlug) {
        const publishResult = await api.post(
          `/problems/${encodeURIComponent(targetSlug)}/publish`,
          {},
          { useToken: true },
        );
        if (!publishResult.ok) {
          await Swal.fire({
            icon: "error",
            title: "บันทึก draft แล้ว แต่ publish ไม่สำเร็จ",
            text: publishResult.error ?? "เกิดข้อผิดพลาดจากระบบ",
          });
          return;
        }
      }

      await Swal.fire({
        icon: "success",
        title: publish ? "เผยแพร่สำเร็จ" : isEditMode ? "อัปเดต draft สำเร็จ" : "สร้าง draft สำเร็จ",
        text: publish ? "สร้าง immutable revision และคิวงาน AI แล้ว" : res.data?.message ?? "บันทึกข้อมูลเรียบร้อย",
        timer: 1200,
        showConfirmButton: false,
      });
      setLastSavedData(JSON.stringify(formData));
      router.push("/dashboard/problems");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: error instanceof Error ? error.message : "เกิดข้อผิดพลาดจากระบบ",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto p-6">
      <Link
        href="/dashboard/problems"
        className="mb-6 inline-flex items-center text-sm font-bold text-muted transition-colors hover:text-foreground"
      >
        <Icon name="arrow-left" className="mr-2 h-4 w-4" /> กลับไปคลังโจทย์
      </Link>

      {/* Page header — sourced from Penpot "Admin02 / Problem Creator — Main". */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
          Problem Creator
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          {isEditMode ? "แก้ไข Problem" : "สร้าง Problem ใหม่"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          จัดโครงสร้างเนื้อหา ทดสอบ และเผยแพร่เป็น Problem Revision ที่แก้ไขย้อนหลังไม่ได้
        </p>
      </div>

      {/* Step guide — presentational overview of the creation flow. */}
      <ol className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { no: "1", label: "Metadata", bar: "bg-secondary" },
          { no: "2", label: "Statement", bar: "bg-primary" },
          { no: "3", label: "Test cases", bar: "bg-warning" },
          { no: "4", label: "Review & publish", bar: "bg-heart" },
        ].map((step) => (
          <li
            key={step.no}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-primary-content ${step.bar}`}
            >
              {step.no}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {step.label}
            </span>
          </li>
        ))}
      </ol>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="p-8">
          {isEditMode ? (
            <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
              <span className="text-muted">Code:</span>{" "}
              <span className="font-bold text-primary">{code}</span>
            </div>
          ) : null}

          {isLoading ? (
            <div className="py-14 text-center text-muted">
              กำลังโหลดข้อมูล...
            </div>
          ) : (
            <form id="problem-upsert-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-muted">
                เนื้อหา Problem จะถูกบันทึกเป็น Markdown draft และเมื่อ Publish จะสร้าง revision ที่แก้ไขไม่ได้ พร้อม checksum และคิว AI index
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ThemedAsyncSelect2
                  label="CATEGORY"
                  value={categoryOption}
                  required
                  loadOptionsAction={loadQuestionCategoryOptionsForForm}
                  onChangeAction={(option) => {
                    setCategoryOption(option);
                    setFormData((prev) => ({
                      ...prev,
                      category_id: option?.value ?? "",
                    }));
                  }}
                  placeholder="ค้นหาเลือกหมวดหมู่..."
                  size="sm"
                />
                <ThemedInput
                  label="TITLE"
                  name="title"
                  value={formData.title}
                  onChangeAction={handleChange}
                  placeholder="เช่น Two Sum"
                  className="h-12 rounded-xl px-4"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ThemedSelect
                  label="DIFFICULTY"
                  name="difficulty"
                  value={formData.difficulty}
                  required
                  onChangeAction={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  className="h-12 rounded-xl px-4"
                >
                  <option value="" className="text-black">
                    ไม่ระบุ
                  </option>
                  <option value="1" className="text-black">
                    ง่าย
                  </option>
                  <option value="2" className="text-black">
                    ปานกลาง
                  </option>
                  <option value="3" className="text-black">
                    ยาก
                  </option>
                </ThemedSelect>
                <ThemedSelect
                  label="EXPECTED COMPLEXITY"
                  name="expected_complexity"
                  value={formData.expected_complexity}
                  required
                  onChangeAction={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expected_complexity: e.target.value,
                    }))
                  }
                  className="h-12 rounded-xl px-4"
                >
                  <option value="" className="text-black">
                    ไม่ระบุ
                  </option>
                  {expectedComplexityOptions.map((item) => (
                    <option key={item} value={item} className="text-black">
                      {item}
                    </option>
                  ))}
                </ThemedSelect>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ThemedInput
                  label="TIME LIMIT (MS)"
                  name="time_limit"
                  type="number"
                  value={formData.time_limit}
                  onChangeAction={handleChange}
                  className="h-12 rounded-xl px-4"
                  required
                />
                <ThemedInput
                  label="MEMORY LIMIT (KB)"
                  name="memory_limit"
                  type="number"
                  value={formData.memory_limit}
                  onChangeAction={handleChange}
                  className="h-12 rounded-xl px-4"
                  required
                />
                <ThemedInput
                  label="POINTS (คะแนน)"
                  name="points"
                  type="number"
                  min={0}
                  value={formData.points}
                  onChangeAction={handleChange}
                  placeholder="เช่น 100"
                  className="h-12 rounded-xl px-4"
                />
                <ThemedSelect
                  label="STATUS"
                  name="status"
                  value={formData.status}
                  onChangeAction={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as "1" | "0",
                    }))
                  }
                  className="h-12 rounded-xl px-4"
                >
                  <option value="1" className="text-black">
                    เปิดใช้งาน
                  </option>
                  <option value="0" className="text-black">
                    ปิดใช้งาน
                  </option>
                </ThemedSelect>
              </div>

              <ThemedAsyncMultiSelect2
                label="TAG"
                value={tagSelections}
                loadOptionsAction={loadTagOptionsForForm}
                onChangeAction={(options) =>
                  setFormData((prev) => ({
                    ...prev,
                    tag: options.map((item) => item.value),
                  }))
                }
                placeholder="ค้นหาเลือกแท็ก..."
                size="sm"
              />

              <MarkdownCodeEditor
                label="PROBLEM STATEMENT (MARKDOWN)"
                value={formData.description}
                onChange={(description) => setFormData((prev) => ({ ...prev, description }))}
                placeholder="เขียนโจทย์ด้วย Markdown พร้อม preview"
                minHeight={300}
              />

              <ThemedInput
                label="CONSTRAINTS"
                name="constraints"
                value={formData.constraints}
                onChangeAction={handleChange}
                placeholder="เช่น 1 <= N <= 10^5"
                className="h-12 rounded-xl px-4"
                required
              />

              <MarkdownCodeEditor
                label="CANONICAL SOLUTION (STAFF ONLY)"
                value={formData.solution}
                onChange={(nextValue) =>
                  setFormData((prev) => ({ ...prev, solution: nextValue }))
                }
                placeholder="พิมพ์เฉลยแบบ markdown ได้ เช่น code block ด้วย ```"
                required
                minHeight={220}
              />

              <section className="space-y-4 rounded-xl border border-border bg-surface-elevated/40 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">TEST CASES</h3>
                  <button
                    type="button"
                    onClick={addTestCase}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-content hover:bg-primary-hover"
                  >
                    + เพิ่ม Test Case
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.test_cases.map((testCase, index) => (
                    <div
                      key={testCase.id ?? `new-${index}`}
                      className="rounded-lg border border-border bg-surface p-3"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted">
                          Case #{index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          disabled={formData.test_cases.length <= 1}
                          className="rounded border border-danger/30 bg-danger/10 px-2 py-1 text-xs text-danger disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Icon name="xmark" className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase text-muted">INPUT DATA</label>
                          <CodeEditor
                            value={testCase.input_data}
                            onChange={(value) => updateTestCase(index, "input_data", value)}
                            height="150px"
                            language="plaintext"
                            className="rounded-xl border border-border"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase text-muted">OUTPUT DATA</label>
                          <CodeEditor
                            value={testCase.output_data}
                            onChange={(value) => updateTestCase(index, "output_data", value)}
                            height="150px"
                            language="plaintext"
                            className="rounded-xl border border-border"
                          />
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <ThemedInput
                          label="CASE ORDER"
                          type="number"
                          min={1}
                          value={testCase.case_order}
                          onChangeAction={(e) =>
                            updateTestCase(index, "case_order", e.target.value)
                          }
                          className="h-10 rounded-xl px-3"
                          required
                        />
                        <ThemedSelect
                          label="IS SIMPLE"
                          value={testCase.is_simple ? "1" : "0"}
                          onChangeAction={(e) =>
                            updateTestCase(
                              index,
                              "is_simple",
                              e.target.value === "1",
                            )
                          }
                          className="h-10 rounded-xl px-3"
                          required
                        >
                          <option value="0" className="text-black">
                            false
                          </option>
                          <option value="1" className="text-black">
                            true
                          </option>
                        </ThemedSelect>
                        <ThemedSelect
                          label="STATUS"
                          value={testCase.status ? "1" : "0"}
                          onChangeAction={(e) =>
                            updateTestCase(
                              index,
                              "status",
                              e.target.value === "1",
                            )
                          }
                          className="h-10 rounded-xl px-3"
                          required
                        >
                          <option value="1" className="text-black">
                            active
                          </option>
                          <option value="0" className="text-black">
                            inactive
                          </option>
                        </ThemedSelect>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-2 flex items-center justify-end gap-3 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/problems")}
                  className="rounded-xl border border-border bg-surface-elevated/50 px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-surface-elevated"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-content transition-all hover:bg-primary-hover disabled:opacity-70"
                >
                  {isSubmitting
                    ? "กำลังบันทึก..."
                    : isEditMode
                      ? "บันทึก Draft"
                      : "สร้าง Draft"}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(undefined, true)}
                  className="rounded-xl bg-secondary px-8 py-3 text-sm font-bold text-secondary-content transition-all hover:bg-secondary-hover disabled:opacity-70"
                >
                  บันทึกและ Publish
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <UnsavedChangesBar
        show={isDirty}
        isSubmitting={isSubmitting}
        onSaveAction={() => handleSubmit()}
      />
    </main>
  );
}
