"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { BS23_ARTIFACTS } from "@/lib/bs23/stages";
import { upsertBs23Artifact } from "@/lib/bs23-crud";
import type { Bs23Artifact } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ArtifactChecklist({ artifacts }: { artifacts: Bs23Artifact[] }) {
  const byItem = new Map(artifacts.map((a) => [a.itemId, a]));

  async function toggle(itemId: string) {
    const current = byItem.get(itemId);
    const next = current?.status === "done" ? "not_started" : "done";
    await upsertBs23Artifact({ itemId, status: next });
  }

  const s1 = BS23_ARTIFACTS.filter((a) => a.stageId === "S1");
  const s5 = BS23_ARTIFACTS.filter((a) => a.stageId === "S5");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[s1, s5].map((group, gi) => (
        <div key={gi}>
          <p className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
            Stage {group[0]?.stageId === "S1" ? "1 · CV" : "5 · HR"}
          </p>
          <ul className="space-y-1.5">
            {group.map((def) => {
              const saved = byItem.get(def.id);
              const done = saved?.status === "done";
              return (
                <li key={def.id}>
                  <button
                    type="button"
                    onClick={() => toggle(def.id)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
                      done
                        ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span>
                      <span className="block text-[13px] font-medium text-foreground">{def.name}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">{def.description}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
