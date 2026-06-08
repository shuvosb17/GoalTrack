"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { useAppStore } from "@/stores/app-store";

export function MobileHeader() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 glass px-4 lg:hidden">
      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={toggleSidebar} aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </Button>
      <Link href="/" className="min-w-0 flex-1">
        <Logo size="sm" />
      </Link>
    </header>
  );
}
