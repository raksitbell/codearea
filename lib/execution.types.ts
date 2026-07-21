export type SubmissionStatus = { id: number; description: string };
export type SubmissionResult = {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  token: string;
  message: string | null;
  status: SubmissionStatus;
};

export const EXECUTION_LANGUAGES = [
  { id: 71, label: "Python" },
] as const;
