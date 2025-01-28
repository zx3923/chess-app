"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkSession = async () => {
    const response = await fetch("/api/oauth");
    const data = await response.json();
    setIsLoggedIn(data);
  };

  useEffect(() => {
    checkSession();
  }, [checkSession, isLoggedIn, setIsLoggedIn]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const hanldeLogout = async () => {
    const response = await fetch("/api/logout");
    console.log(response);
    if (response.ok) {
      redirect("/");
    }
  };

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
                  href="/"
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
                <Link
                  href="/"
                  className="text-gray-300 hover:bg-neutral-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  랜덤 매칭
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isLoggedIn ? (
                <Link
                  href="/home"
                  className="bg-neutral-700 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white"
                >
                  <span className="sr-only">View profile</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
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
            {isLoggedIn ? (
              <button
                onClick={hanldeLogout}
                className="text-gray-300 hover:bg-neutral-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
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
