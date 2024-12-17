import { getSession } from "@/lib/session/session";

export async function GET() {
  console.log("logout");
  const session = await getSession();
  session.destroy();
}
