"use client";

import { useState } from "react";
import { Menu, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { email, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 lg:px-6 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-text-secondary hover:text-text-primary"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-raised transition-colors"
        >
          <div className="h-7 w-7 rounded-full bg-signal/10 border border-signal/30 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-signal" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm text-text-primary leading-none">{email || "User"}</p>
            <p className="text-xs text-text-muted capitalize mt-0.5">{role || "user"}</p>
          </div>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border-strong bg-surface-raised shadow-xl z-20 py-1">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-negative hover:bg-negative/5 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
