import { getSession } from "@/lib/session/session";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("logout");

  try {
    const session = await getSession();
    session.destroy();

    const response = NextResponse.json({ message: "Logged out successfully" });
    // 캐시 제어 헤더 추가: 로그아웃 후 페이지가 캐시되지 않도록 설정
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
    // 오류 응답에도 캐시 제어 헤더 추가
    response.headers.set("Cache-Control", "no-store");

    return response;
  }
}
