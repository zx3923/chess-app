import { getSession } from "@/lib/session/session";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("logout");

  try {
    const session = await getSession();
    session.destroy();

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
