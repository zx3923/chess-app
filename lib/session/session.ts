import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface SessionContent {
  id?: number;
}

export async function getSession() {
  return getIronSession<SessionContent>(await cookies(), {
    cookieName: "test",
    password: process.env.COOKIE_PASSWORD!,
  });
}

export async function successLogin(id: number) {
  const session = await getSession();
  session.id = id;
  await session.save();
}
