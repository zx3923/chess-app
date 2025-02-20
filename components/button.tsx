"use client";

import { useFormStatus } from "react-dom";

interface ButtonProps {
  text: string;
  width?: string;
}

export default function Button({ text, width }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      style={{ width: width ? `${width}px` : "100%" }}
      className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {pending ? "로딩 중" : text}
    </button>
  );
}
