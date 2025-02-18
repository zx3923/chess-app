import db from "@/lib/db";
import { getSession } from "@/lib/session/session";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log("getuser test!!!"); // 로그 확인

  const session = await getSession();

  if (session?.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
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
