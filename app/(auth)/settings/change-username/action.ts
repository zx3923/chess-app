"use server";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session/session";

const formSchema = z
  .object({
    username: z
      .string()
      .min(1, "유저명은 필수 입니다")
      .min(4, "4글자 이상으로 해주세요")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "비밀번호는 6자 이상입니다")
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
  })
  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        user_name: username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      console.log(user);
      ctx.addIssue({
        code: "custom",
        message: "이미 사용중인 이름입니다.",
        path: ["username"],
        fatal: true,
      });
      return z.NEVER;
    }
  });

export async function changeUsername(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    password: formData.get("password"),
  };
  const session = await getSession();
  console.log(session);
  const result = await formSchema.spa(data);

  if (!result.success) {
    return {
      ...result.error.flatten(),
      formData: data,
    };
  } else {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
      select: {
        id: true,
        password: true,
      },
    });
    const ok = await bcrypt.compare(
      result.data.password,
      user?.password ?? "XXXX"
    );
    if (ok) {
      const user = await db.user.update({
        where: {
          id: session.id,
        },
        data: {
          user_name: result.data.username,
        },
      });
      redirect("/settings");
    } else {
      return {
        fieldErrors: {
          password: ["잘못된 비밀번호 입니다."],
          username: [],
        },
      };
    }
  }
}
