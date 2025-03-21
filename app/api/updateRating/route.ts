import db from "@/lib/db";
import { getSession } from "@/lib/session/session";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getSession();

  try {
    const body = await request.json();
    const { win, eloResult, gameMode } = body;
    const ratingField = `${gameMode}Rating`;
    if (win) {
      const user = await db.user.update({
        where: {
          id: session.id,
        },
        data: { [ratingField]: { increment: eloResult } },
      });
      console.log("winner", user);
    } else {
      const user = await db.user.update({
        where: {
          id: session.id,
        },
        data: { [ratingField]: { decrement: eloResult } },
      });
      console.log("loser", user);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
