"use client";

import Link from "next/link";
import React from "react";
import {
  PencilSquareIcon,
  ComputerDesktopIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import { useUser } from "@/lib/context/UserContext";

export default function Home() {
  const { user, logout } = useUser();
  const hanldeLogout = async () => {
    const response = await fetch("/api/logout");
    console.log(response);
    if (response.ok) {
      logout();
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-200 p-4">
      <div className="w-full min-w-96 max-w-screen-lg bg-neutral-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>아바타</div>
            <div className="text-lg font-semibold">{user.username}</div>
            <div className="text-sm text-neutral-400">{user.email}</div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded hover:bg-neutral-600">친구</button>
            <button className="p-2 rounded hover:bg-neutral-600">메세지</button>
            <Link href="/settings" className="p-2 rounded hover:bg-neutral-600">
              설정
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Link
            href="/play/online/new"
            className="flex justify-start items-center gap-2 p-2 border border-neutral-700 py-4 hover:bg-neutral-700 rounded"
          >
            <PencilSquareIcon className="size-7" />
            <span>새 게임</span>
          </Link>
          <Link
            href="/play/online/friend"
            className="flex justify-start items-center gap-2 p-2 border border-neutral-700 py-4 hover:bg-neutral-700 rounded"
          >
            <UsersIcon className="size-7" />
            <span>친구와 플레이</span>
          </Link>
          <Link
            href="/play/computer"
            className="flex justify-start items-center gap-2 p-2 border border-neutral-700 py-4 hover:bg-neutral-700 rounded"
          >
            <ComputerDesktopIcon className="size-7" />
            <span>봇과 플레이</span>
          </Link>
          <button className="border border-neutral-700 py-4 hover:bg-neutral-700 rounded">
            방만들기
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={hanldeLogout}
            className="w-24 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
