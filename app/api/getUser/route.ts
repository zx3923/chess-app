import db from "@/lib/db";
import { getSession } from "@/lib/session/session";
import { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const session = await getSession();

  if (session?.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
      select: {
        id: true,
        user_name: true,
        email: true,
        blitzRating: true,
        bulletRating: true,
        rapidRating: true,
      },
    });

    if (user) {
      return Response.json(user); // 유저 정보를 반환
    } else {
      return Response.json({ message: "User not found" }, { status: 404 });
    }
  } else {
    return Response.json({ message: "Not authenticated" }, { status: 401 });
  }
}
