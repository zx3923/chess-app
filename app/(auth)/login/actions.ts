"use server";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import { successLogin } from "@/lib/session/session";

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
  return Boolean(user);
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
        return true; // 이메일 형식이 잘못된 경우 다음 검증을 스킵.
      }
      // 이메일이 유효한 형식일 경우에만 존재유무 검증 실행
      return checkEmailExists(email);
    }, "존재하지 않는 이메일 입니다."),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, "비밀번호는 6자 이상입니다.")
    .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export async function logIn(prevState: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  const result = await formSchema.spa(data);

  if (!result.success) {
    return {
      ...result.error.flatten(),
      formData: data,
    };
  } else {
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        password: true,
        user_name: true,
        email: true,
        blitzRating: true,
        bulletRating: true,
        rapidRating: true,
      },
    });
    const ok = await bcrypt.compare(
      result.data.password,
      user!.password ?? "XXXX"
    );
    if (ok) {
      await successLogin(user!.id);
      // redirect("/home");
      return {
        id: user?.id,
        username: user?.user_name,
        isLoggedIn: true,
        email: user?.email,
        blitzRating: user?.blitzRating,
        bulletRating: user?.bulletRating,
        rapidRating: user?.rapidRating,
      };
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
