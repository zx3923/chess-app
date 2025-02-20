"use client";

import Input from "@/components/input";
import { useActionState } from "react";
import { changeUsername } from "./action";
import Button from "@/components/button";

export default function ChangeUsername() {
  const [state, action] = useActionState(changeUsername, null);
  return (
    <div className="w-2/3 bg-neutral-800 rounded p-4">
      <div className="text-2xl font-bold mb-8">사용자명 변경</div>
      {/* <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:flex">
          <div className="w-44 mb-2 sm:mb-0">사용자명</div>
          <input type="text" />
        </div>
        <div className="grid grid-cols-1 sm:flex">
          <div className="w-44 mb-2 sm:mb-0">비밀번호</div>
          <input type="text" />
        </div>
      </div> */}
      <form action={action} className="space-y-6">
        {/* <div className="grid grid-cols-1 sm:flex items-center"> */}
        {/* <div className="w-44 mb-2 sm:mb-0">사용자명</div> */}
        <Input
          name="username"
          type="text"
          placeholder="사용자명"
          errors={state?.fieldErrors.username}
        />
        {/* </div> */}
        {/* <div className="grid grid-cols-1 sm:flex items-center"> */}
        {/* <div className="w-44 mb-2 sm:mb-0">비밀번호</div> */}
        <Input
          name="password"
          type="password"
          placeholder="비밀번호"
          errors={state?.fieldErrors.password}
        />
        <Button text="저장" width="100" />
        {/* </div> */}
      </form>
    </div>
  );
}
