export default function ChangeUsername() {
  return (
    <div className="w-2/3 bg-neutral-700 rounded p-4">
      <div className="text-2xl font-bold">사용자명 변경</div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:flex">
          <div className="w-44 mb-2 sm:mb-0">사용자명</div>
          <input type="text" />
        </div>
        <div className="grid grid-cols-1 sm:flex">
          <div className="w-44 mb-2 sm:mb-0">비밀번호</div>
          <input type="text" />
        </div>
      </div>
    </div>
  );
}
