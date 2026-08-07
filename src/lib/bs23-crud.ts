import { v4 as uuid } from "uuid";
import { db } from "./db";
import type { Bs23Artifact, Bs23Drill, Bs23DrillMode, Bs23StageId } from "./types";
import { nowISO } from "./utils";

export async function saveBs23Drill(input: {
  stageId: Bs23StageId;
  competencyId: string;
  date: string;
  mode: Bs23DrillMode;
  scorePercent: number;
  durationMinutes?: number;
  difficulty?: Bs23Drill["difficulty"];
  notes?: string;
}): Promise<Bs23Drill> {
  const drill: Bs23Drill = {
    id: uuid(),
    ...input,
    createdAt: nowISO(),
  };
  await db.bs23Drills.add(drill);
  return drill;
}

export async function deleteBs23Drill(id: string): Promise<void> {
  await db.bs23Drills.delete(id);
}

export async function upsertBs23Artifact(input: {
  itemId: string;
  status: Bs23Artifact["status"];
  notes?: string;
}): Promise<Bs23Artifact> {
  const existing = await db.bs23Artifacts.where("itemId").equals(input.itemId).first();
  const now = nowISO();
  if (existing) {
    const updated: Bs23Artifact = {
      ...existing,
      status: input.status,
      notes: input.notes ?? existing.notes,
      completedAt: input.status === "done" ? now : existing.completedAt,
      updatedAt: now,
    };
    await db.bs23Artifacts.put(updated);
    return updated;
  }
  const artifact: Bs23Artifact = {
    id: uuid(),
    itemId: input.itemId,
    status: input.status,
    notes: input.notes,
    completedAt: input.status === "done" ? now : undefined,
    updatedAt: now,
  };
  await db.bs23Artifacts.add(artifact);
  return artifact;
}
