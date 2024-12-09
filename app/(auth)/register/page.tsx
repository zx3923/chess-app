"use client";

import Link from "next/link";
import Input from "@/components/input";
import { useActionState } from "react";
import Button from "@/components/button";
import { createAccount } from "./actions";

export default function Register() {
  const [state, action] = useActionState(createAccount, null);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-200 p-4">
      <div className="max-w-md w-full space-y-8 bg-neutral-800 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-200">
            회원가입
          </h2>
        </div>
        <form action={action} className="mt-8 space-y-6">
          <Input
            name="userName"
            type="text"
            placeholder="유저명"
            defaultValue={state?.formData?.userName || ""}
            // required
            // minLength={PASSWORD_MIN_LENGTH}
            // maxLength={10}
            errors={state?.fieldErrors.userName}
          />
          <Input
            name="email"
            type="email"
            placeholder="이메일"
            defaultValue={state?.formData?.email || ""}
            // required
            errors={state?.fieldErrors.email}
          />
          <Input
            name="password"
            type="password"
            placeholder="비밀번호"
            // required
            // minLength={PASSWORD_MIN_LENGTH}
            errors={state?.fieldErrors.password}
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="비밀번호 확인"
            // required
            // minLength={PASSWORD_MIN_LENGTH}
            errors={state?.fieldErrors.confirmPassword}
          />
          <Button text="가입하기" />
        </form>
        <div className="text-center">
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            메인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
