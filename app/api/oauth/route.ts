import { NextRequest } from "next/server";
import { getSession } from "@/lib/session/session";

export async function GET(request: NextRequest) {
  console.log(request);

  const session = await getSession();
  if (session.id) {
    return Response.json(true);
  } else {
    return Response.json(false);
  }
}
