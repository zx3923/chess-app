"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import {
  UserCircleIcon,
  Bars4Icon,
  BarsArrowUpIcon,
} from "@heroicons/react/24/solid";
import { useUser } from "@/lib/context/UserContext";
import { useMenu } from "@/lib/context/MenuContext";

export default function TopBar() {
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMenuOpen, toggleMenu, closeMenu } = useMenu();
  const { user, setUser, logout } = useUser();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function getUser() {
      const response = await fetch("/api/getUser", {
        cache: "no-store",
      });
      if (response.ok) {
        const userData = await response.json();
        setUser({
          isLoggedIn: true,
          id: userData.id,
          username: userData.user_name,
          email: userData.email,
        });
      }
    }
    getUser();
  }, []);

  const hanldeLogout = async () => {
    const response = await fetch("/api/logout", {
      cache: "no-store",
    });
    if (response.ok) {
      logout();
      window.location.href = "/";
    }
  };

  // Close menu if clicked outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu]);

  return (
    <nav className="bg-neutral-800 shadow-lg absolute w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              체스 아이콘
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/home"
                  className="text-gray-300 hover:bg-neutral-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  홈
                </Link>
                <Link
                  href="/game"
                  className="text-gray-300 hover:bg-neutral-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  게임
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user.isLoggedIn ? (
                <Link
                  href="/settings"
                  className="bg-neutral-700 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white"
                >
                  <span className="sr-only">View profile</span>
                  <UserCircleIcon className="w-6" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-gray-300 hover:bg-neutral-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="bg-neutral-700 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <Bars4Icon className="w-6" />
              ) : (
                <BarsArrowUpIcon className="w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div ref={menuRef} className="md:hidden z-10 relative" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="text-gray-300 hover:bg-neutral-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              홈
            </Link>
            <Link
              href="/"
              className="text-gray-300 hover:bg-neutral-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              게임
            </Link>
            <Link
              href="/"
              className="text-gray-300 hover:bg-neutral-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              랜덤 매칭
            </Link>
            {user.isLoggedIn ? (
              <button
                onClick={hanldeLogout}
                className="w-full text-left text-gray-300 hover:bg-neutral-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="text-gray-300 hover:bg-neutral-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
