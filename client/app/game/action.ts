"use server";

import db from "@/lib/db";
import { addToQueue } from "@/lib/match/matching";
import { getSession } from "@/lib/session/session";

export async function matchStart(prevState: any, formData: FormData) {
  const gamemode = formData.get("gamemode") as string;
  const user = await getSession();
  const userInfo = await db.user.findUnique({
    where: {
      id: user.id,
    },
  });
  if (!userInfo || !gamemode) {
    return "에러상황반환";
  }

  console.log(userInfo);
  console.log(gamemode);

  await addToQueue(userInfo?.id!, gamemode, userInfo?.rating);

  return 1;
}
