import { authenticate } from "@/server/auth/module";

export async function currentUser() {
  return authenticate();
}
