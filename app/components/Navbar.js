"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePremium } from "./PremiumContext";

export default function Navbar() {
  const pathname = usePathname();
  const { isPremium } = usePremium();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/70">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className={`text-lg font-bold tracking-tight transition-colors ${
            pathname === "/" ? "text-indigo-600" : "hover:text-indigo-600"
          }`}
        >
          ⚡ TechCart
        </Link>

        <div className="flex items-center gap-3">
          {isPremium && (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              Premium ✓
            </span>
          )}
          <Link
            href="/premium"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              pathname === "/premium"
                ? "bg-indigo-700 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {isPremium ? "Manage plan" : "Go Premium"}
          </Link>
        </div>
      </nav>
    </header>
  );
}