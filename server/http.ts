import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "@/server/domain/errors";

const statusByCode = {
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UPSTREAM_FAILURE: 502,
} as const;

export function jsonError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "ข้อมูลที่ส่งมาไม่ถูกต้อง", details: error.flatten() },
      { status: 400 },
    );
  }
  if (error instanceof DomainError) {
    return NextResponse.json(
      { error: error.code, message: error.message, details: error.details },
      { status: statusByCode[error.code] },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "INTERNAL_ERROR", message: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
}

export function parsePositiveInt(value: string | null, fallback: number, max = 100) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}
