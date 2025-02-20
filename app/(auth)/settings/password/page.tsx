"use client";
import Button from "@/components/button";
import Input from "@/components/input";
import { useActionState } from "react";
import { changePassword } from "./action";

export default function Password() {
  const [state, action] = useActionState(changePassword, null);
  return (
    <div className="w-2/3 bg-neutral-800 rounded p-4">
      <div className="text-2xl font-bold mb-8">비밀번호 변경</div>
      <form action={action} className="space-y-6">
        <Input
          name="password"
          type="password"
          placeholder="현재 비밀번호"
          errors={state?.fieldErrors.password}
        />
        <Input
          name="newPassword"
          type="password"
          placeholder="새 비밀번호"
          errors={state?.fieldErrors.newPassword}
        />
        <Input
          name="confirmPassword"
          type="password"
          placeholder="새 비밀번호 확인"
          errors={state?.fieldErrors.confirmPassword}
        />
        <Button text="저장" width="100" />
      </form>
    </div>
  );
}
