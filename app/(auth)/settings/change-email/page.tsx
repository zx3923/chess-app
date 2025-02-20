"use client";

import { useActionState } from "react";
import Input from "@/components/input";
import Button from "@/components/button";
import { changeEmail } from "./action";

export default function ChangeEmail() {
  const [state, action] = useActionState(changeEmail, null);
  return (
    <div className="w-2/3 bg-neutral-800 rounded p-4">
      <div className="text-2xl font-bold mb-8">이메일 변경</div>
      <form action={action} className="space-y-6">
        <Input
          name="email"
          type="email"
          placeholder="이메일"
          errors={state?.fieldErrors.email}
        />
        <Input
          name="password"
          type="password"
          placeholder="비밀번호"
          errors={state?.fieldErrors.password}
        />
        <Button text="저장" width="100" />
      </form>
    </div>
  );
}
