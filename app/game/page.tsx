"use client";

import { useActionState } from "react";
import { matchStart } from "./action";

export default function Game() {
  const [state, action] = useActionState(matchStart, null);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-neutral-200 p-4">
      <div>
        <form action={action}>
          <select name="gamemode">
            <option value="rapid">래피드</option>
            <option value="blitz">블리츠</option>
            <option value="bullet">불릿</option>
          </select>
          <button className="bg-blue-500 px-6 py-2 rounded-sm">매칭</button>
        </form>
      </div>
    </div>
  );
}
