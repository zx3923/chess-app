import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  console.log(session);

  const logOut = async () => {
    "use server";
    const session = await getSession();
    session.destroy();
    redirect("/");
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-200 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            체스 게임
          </h1>
          <p className="text-xl text-neutral-400 mb-8">
            최고의 온라인 체스 경험
          </p>
        </div>
        <div className="space-y-4">
          <button
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-neutral-100 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="게임 시작"
          >
            게임 시작
          </button>
          <div className="flex space-x-4">
            {session.id ? (
              <>
                <form
                  action={logOut}
                  className="flex-1 text-center px-6 py-2 bg-neutral-700 text-neutral-200 rounded-lg text-base font-medium hover:bg-neutral-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-opacity-50"
                >
                  <button>로그아웃</button>
                </form>
              </>
            ) : (
              <>
                <Link
                  className="flex-1 px-6 py-2 text-center bg-neutral-700 text-neutral-200 rounded-lg text-base font-medium hover:bg-neutral-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-opacity-50"
                  href="/login"
                >
                  로그인
                </Link>
                <Link
                  className="flex-1 px-6 py-2 text-center bg-purple-600 text-neutral-200 rounded-lg text-base font-medium hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  href="/register"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
