import db from "@/lib/db";
import { getSession } from "@/lib/session/session";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export default async function Setting() {
  const user = await ();
  return (
    <div className="w-2/3 bg-neutral-800 rounded p-4">
      <div className="flex flex-col gap-4">
        <div className=" grid grid-cols-1 sm:flex ">
          <div className="w-44 mb-2 sm:mb-0">사용자명</div>
          <div>
            <span className="mr-7">{user.user_name}</span>
            <Link
              href="/settings/change-username"
              className="text-blue-500 text-sm"
            >
              변경
            </Link>
          </div>
        </div>
        <div className=" grid grid-cols-1 sm:flex ">
          <div className="w-44 mb-2 sm:mb-0">전화번호</div>
          <div>
            <span className={`${user.phone ? "mr-7" : ""}`}>{user.phone}</span>
            <Link
              href="/settings/change-phone-number"
              className="text-blue-500 text-sm"
            >
              {user.phone ? "변경" : "추가"}
            </Link>
          </div>
        </div>
        <div className=" grid grid-cols-1 sm:flex ">
          <div className="w-44 mb-2 sm:mb-0">이메일</div>
          <div>
            <span className="mr-7">{user.email}</span>
            <Link
              href="/settings/change-email"
              className="text-blue-500 text-sm"
            >
              변경
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
