"use client";

import {
  UserIcon,
  ComputerDesktopIcon,
  KeyIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingTabBar() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const lastSegment = segments[segments.length - 1];
  return (
    <div className="w-1/3 max-[444px]:w-12">
      <Link
        href="/settings"
        className={`h-12 flex items-center p-4 border-b-2 border-neutral-800 gap-2 rounded-t
        ${lastSegment === "settings" ? "bg-neutral-900" : "bg-neutral-700"}`}
      >
        <UserIcon className="w-4" />
        <span className="max-[444px]:hidden">프로필</span>
      </Link>
      <Link
        href="/settings/themes"
        className={`h-12 flex items-center p-4 border-b-2 border-neutral-800 gap-2
        ${lastSegment === "themes" ? "bg-neutral-900" : "bg-neutral-700"}`}
      >
        <ComputerDesktopIcon className="w-4" />
        <span className="max-[444px]:hidden">테마</span>
      </Link>
      <Link
        href="/settings/password"
        className={`h-12 flex items-center p-4 gap-2 rounded-b ${
          lastSegment === "password" ? "bg-neutral-900" : "bg-neutral-700"
        }`}
      >
        <KeyIcon className="w-4" />
        <span className="max-[444px]:hidden">비밀번호</span>
      </Link>
    </div>
  );
}
