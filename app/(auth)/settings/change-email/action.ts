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

const checkEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  // if(user){
  //   return true
  // } else {
  //   return false
  // }
  return !Boolean(user);
};

const formSchema = z.object({
  email: z
    .string()
    .email({
      message: "올바른 이메일 주소를 입력해주세요.",
    })
    .toLowerCase()
    .refine((email) => {
      const isValidEmail = z.string().email().safeParse(email).success;
      if (!isValidEmail) {
        return true;
      }
      return checkEmailExists(email);
    }, "이미 존재하는 이메일 입니다."),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, "비밀번호는 6자 이상입니다.")
    .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export async function changeEmail(prevState: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
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
      const user = await db.user.update({
        where: {
          id: session.id,
        },
        data: {
          email: result.data.email,
        },
      });
      console.log(user);
      redirect("/settings");
    } else {
      return {
        fieldErrors: {
          password: ["잘못된 비밀번호 입니다."],
          email: [],
        },
      };
    }
  }
}
