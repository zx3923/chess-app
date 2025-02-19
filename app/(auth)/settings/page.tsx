import Link from "next/link";

export default function Setting() {
  return (
    <div className="w-2/3 bg-neutral-700 rounded p-4">
      <div className="flex flex-col gap-4">
        <div className=" grid grid-cols-1 sm:flex ">
          <div className="w-44 mb-2 sm:mb-0">사용자명</div>
          <div>
            <span className="mr-7">zx3923</span>
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
            <span className="mr-7">010-0101-0101</span>
            <Link
              href="/settings/change-phone-number"
              className="text-blue-500 text-sm"
            >
              변경
            </Link>
          </div>
        </div>
        <div className=" grid grid-cols-1 sm:flex ">
          <div className="w-44 mb-2 sm:mb-0">이메일</div>
          <div>
            <span className="mr-7">seop@gmail.com</span>
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
