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

export default async function Profile() {
  const user = await getUser();
  const logOut = async () => {
    "use server";
    const session = await getSession();
    await session.destroy();
    redirect("/");
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-neutral-200 p-4">
      <div className="w-full max-w-md bg-neutral-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="text-3xl font-bold mb-4 text-center">
          어서오세요 {user.user_name} 님
        </h1>
        <div className="mb-6">
          <p className="text-lg mb-2">이메일: {user.email}</p>
          {/* <p className="text-lg mb-2">이름: {user.lastName}{user.firstName}</p> */}
        </div>
        <div className="flex flex-col space-y-4">
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
