"use server";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { getSession } from "@/lib/session/session";
import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

const checkPasswords = ({
  newPassword,
  confirmPassword,
}: {
  newPassword: string;
  confirmPassword: string;
}) => newPassword === confirmPassword;

const formSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "비밀번호는 6자 이상으로 해주세요")
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "비밀번호는 6자 이상으로 해주세요")
      .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirmPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, "비밀번호는 6자 이상으로 해주세요"),
  })
  .refine(checkPasswords, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export async function changePassword(prevState: any, formData: FormData) {
  const data = {
    password: formData.get("password"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };
  const session = await getSession();
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
      const hashedPassword = await bcrypt.hash(result.data.newPassword, 12);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const user = await db.user.update({
        where: {
          id: session.id,
        },
        data: {
          password: hashedPassword,
        },
      });
      redirect("/settings");
    } else {
      return {
        fieldErrors: {
          password: ["잘못된 비밀번호 입니다."],
          newPassword: [],
          confirmPassword: [],
        },
      };
    }
  }
}
