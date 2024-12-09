"use client";

import Link from "next/link";
import { logIn } from "./actions";
import { useActionState } from "react";
import Input from "@/components/input";
import Button from "@/components/button";

export default function Login() {
  const [state, action] = useActionState(logIn, null);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-200 p-4">
      <div className="max-w-md w-full space-y-8 bg-neutral-800 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-200">
            로그인
          </h2>
        </div>
        <form action={action} className="mt-8 space-y-6">
          <Input
            name="email"
            type="email"
            placeholder="이메일"
            defaultValue={state?.formData?.email || ""}
            errors={state?.fieldErrors.email}
          />
          <Input
            name="password"
            type="password"
            placeholder="비밀번호"
            errors={state?.fieldErrors.password}
          />
          <Button text="가입하기" />
        </form>
        <div className="text-center space-y-2">
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            계정이 없으신가요? 회원가입
          </Link>
          <div>
            <Link
              href="/"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              메인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
