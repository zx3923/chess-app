import {
  getAccessToken,
  getGithubEmail,
  getGithubPropfile,
} from "@/lib/auth/github/githubService";
import isExistUsername from "@/lib/auth/isExistUsername";
import db from "@/lib/db";
import { successLogin } from "@/lib/session/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return new Response(null, {
      status: 400,
    });
  }
  const { error, access_token } = await getAccessToken(code);
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }
  const email = await getGithubEmail(access_token);
  const { id, name, avatar_url } = await getGithubPropfile(access_token);

  const user = await db.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
    },
  });
  if (user) {
    await successLogin(user.id);
    return redirect("/profile");
  }

  const isExist = await isExistUsername(name);

  const newUser = await db.user.create({
    data: {
      github_id: id + "",
      user_name: isExist ? `${name}-gh` : name,
      avatar: avatar_url,
    },
    select: {
      id: true,
    },
  });
  await successLogin(newUser.id);
  redirect("/profile");
}
