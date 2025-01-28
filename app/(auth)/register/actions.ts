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
import { successLogin } from "@/lib/session/session";

const checkPasswords = ({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword: string;
}) => password === confirmPassword;

const formSchema = z
  .object({
    userName: z
      .string()
      .min(1, "유저명은 필수 입니다")
      .min(4, "4글자 이상으로 해주세요")
      .toLowerCase()
      .trim(),
    // .refine(checkUniqueUsername, "이미 사용중인 유저명 입니다"),
    email: z
      .string()
      .email({
        message: "올바른 이메일 주소를 입력해주세요.",
      })
      .toLowerCase(),
    // .refine(checkUniqueEmail, "이미 사용중인 이메일 입니다"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "비밀번호는 6자 이상으로 해주세요")
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirmPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "비밀번호는 6자 이상으로 해주세요"),
  })
  .superRefine(async ({ userName }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        user_name: userName,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이미 사용중인 이름입니다.",
        path: ["userName"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이미 사용중인 이메일 입니다",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .refine(checkPasswords, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    userName: formData.get("userName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const result = await formSchema.spa(data);

  if (!result.success) {
    console.log(result.error.flatten());
    return {
      ...result.error.flatten(),
      formData: data,
    };
  } else {
    const hashedPassword = await bcrypt.hash(result.data.password, 12);
    const user = await db.user.create({
      data: {
        user_name: result.data.userName,
        email: result.data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });
    await successLogin(user.id);
    // const session = await getSession();
    // session.id = user.id;
    // await session.save();
    redirect("/home");
  }
}
