import db from "@/lib/db";
import { getSession } from "@/lib/session/session";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import React, { useState } from "react";
async function getUser() {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
}

export default async function Home() {
  const user = await getUser();
  const logOut = async () => {
    "use server";
    const session = await getSession();
    await session.destroy();
    redirect("/");
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-200 p-4">
      <div className="w-full min-w-96 max-w-screen-lg bg-neutral-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <div>아바타</div>
            <div className="text-lg font-semibold">{user.user_name}</div>
            <div className="text-sm text-neutral-400">{user.email}</div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded hover:bg-neutral-600">친구</button>
            <button className="p-2 rounded hover:bg-neutral-600">메세지</button>
            <button className="p-2 rounded hover:bg-neutral-600">설정</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <button className="border border-neutral-700 py-4 hover:bg-neutral-700 rounded">
            새 게임
          </button>
          <button className="border border-neutral-700 py-4 hover:bg-neutral-700 rounded">
            친구와 플레이
          </button>
          <button className="border border-neutral-700 py-4 hover:bg-neutral-700 rounded">
            일반게임
          </button>
          <button className="border border-neutral-700 py-4 hover:bg-neutral-700 rounded">
            방만들기
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            href="/edit-profile"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-center"
          >
            계정 / 정보 관리
          </Link>
          <form action={logOut} className="flex justify-center">
            <button className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
