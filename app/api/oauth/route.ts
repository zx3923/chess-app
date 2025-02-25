import { NextRequest } from "next/server";
import { getSession } from "@/lib/session/session";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  console.log("oauth", request);
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    console.log(user);
    return Response.json(true);
  } else {
    return Response.json(false);
  }
}
