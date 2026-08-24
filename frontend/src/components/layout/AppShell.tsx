"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-bg">{children}</main>
      </div>
    </div>
  );
}
