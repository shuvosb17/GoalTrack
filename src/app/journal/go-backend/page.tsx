"use client";

import Link from "next/link";
import { ArrowLeft, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoBackendResourcesPanel } from "@/components/journal/go-backend-resources-panel";

export default function GoBackendResourcesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/journal">
            <Button variant="ghost" size="sm" className="mb-3 -ml-2 gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Journal
            </Button>
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-medium tracking-tight sm:text-3xl">
            <BookMarked className="h-7 w-7 text-violet-400" />
            Go Backend Resource Library
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Curated docs, videos, and articles for every subtopic in your Remote Go Backend Engineer path
            (Modules 0–23). Filter by module and topic, or search across the full library.
          </p>
        </div>
      </div>

      <GoBackendResourcesPanel />
    </div>
  );
}
