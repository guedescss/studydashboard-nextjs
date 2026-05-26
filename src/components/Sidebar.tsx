"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { useIsMobile } from "@/hooks/useMediaQuery";

const iconMap: Record<string, string> = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  timer: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  kanban: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7",
  schedule: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  diary: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
};

export function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-40 bg-zinc-900/95 border-b border-white/10 backdrop-blur-xl pt-[env(safe-area-inset-top,0px)]">
          <div className="flex items-center justify-center h-12 px-4">
            <h1 className="text-base font-bold text-white tracking-tight">
              <span className="text-violet-400">Study</span>Dashboard
            </h1>
          </div>
        </header>
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 border-t border-white/10 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)]">
          <div className="flex justify-around items-center h-14 px-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors text-[10px] font-medium cursor-pointer ${
                    active ? "text-violet-400" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconMap[item.icon]} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    );
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 bg-zinc-900/80 border-r border-white/5 backdrop-blur-xl flex flex-col">
      <div className="px-6 py-6 border-b border-white/5">
        <h1 className="text-lg font-bold text-white tracking-tight">
          <span className="text-violet-400">Study</span>Dashboard
        </h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium ${
                active
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={iconMap[item.icon]} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
