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
  // 세션이 없고 publicOnlyUrls에 해당하지 않는 URL인 경우 리디렉션
  if (!session.id && !exists) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 로그인 상태에서 publicOnlyUrls에 해당하는 URL로 들어가면 /home으로 리디렉션
  if (session.id && exists) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
