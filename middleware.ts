import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session/session";

interface Routes {
  [key: string]: boolean;
}

const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/register": true,
  "/github/start": true,
  "/github/complete": true,
};

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const exists = publicOnlyUrls[request.nextUrl.pathname];
  console.log("session", session);
  if (!session.id) {
    if (!exists) {
      // 비로그인 경우 공용url 제외 다른 url 진입시 / 으로 보냄
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    // 로그인 경우 공용 url 진입시 /home 로 보냄
    if (exists) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
