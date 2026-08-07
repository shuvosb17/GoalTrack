"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BS23_STAGES, allCompetencyDefs } from "@/lib/bs23/stages";
import { saveBs23Drill } from "@/lib/bs23-crud";
import type { Bs23DrillMode, Bs23StageId } from "@/lib/types";
import { todayISO } from "@/lib/utils";

const MODES: { value: Bs23DrillMode; label: string }[] = [
  { value: "mcq_mock", label: "MCQ mock exam" },
  { value: "written_paper", label: "Written paper (onsite style)" },
  { value: "timed_dsa", label: "Timed DSA (IDE)" },
  { value: "paper_dsa", label: "Paper DSA (no IDE)" },
  { value: "system_design", label: "System design" },
  { value: "erd", label: "ERD on paper" },
  { value: "sql_handwrite", label: "Hand-written SQL" },
  { value: "stack_test", label: "Stack-specific test" },
  { value: "mock_interview", label: "Mock interview" },
  { value: "presentation", label: "Presentation practice" },
  { value: "star_practice", label: "STAR story practice" },
  { value: "personality", label: "Personality / aptitude" },
];

export function DrillLoggerDialog() {
  const [open, setOpen] = useState(false);
  const [stageId, setStageId] = useState<Bs23StageId>("S2");
  const [competencyId, setCompetencyId] = useState("");
  const [mode, setMode] = useState<Bs23DrillMode>("mcq_mock");
  const [score, setScore] = useState("70");
  const [duration, setDuration] = useState("45");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const competencies = useMemo(
    () => allCompetencyDefs().filter((c) => c.stage.id === stageId),
    [stageId]
  );

  const handleStageChange = (id: Bs23StageId) => {
    setStageId(id);
    const first = allCompetencyDefs().find((c) => c.stage.id === id);
    setCompetencyId(first?.competency.id ?? "");
  };

  async function handleSave() {
    if (!competencyId) return;
    setSaving(true);
    try {
      await saveBs23Drill({
        stageId,
        competencyId,
        date: todayISO(),
        mode,
        scorePercent: Math.min(100, Math.max(0, Number(score) || 0)),
        durationMinutes: Number(duration) || undefined,
        difficulty,
        notes: notes.trim() || undefined,
      });
      setOpen(false);
      setNotes("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Log drill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log evidence</DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-muted-foreground">
          Only logged drills count toward readiness. Reading or watching without a score adds zero.
        </p>
        <div className="grid gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-muted-foreground">Stage</label>
            <Select value={stageId} onValueChange={(v) => handleStageChange(v as Bs23StageId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BS23_STAGES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-muted-foreground">Competency</label>
            <Select value={competencyId} onValueChange={setCompetencyId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick competency" />
              </SelectTrigger>
              <SelectContent>
                {competencies.map(({ competency }) => (
                  <SelectItem key={competency.id} value={competency.id}>
                    {competency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-muted-foreground">Mode</label>
            <Select value={mode} onValueChange={(v) => setMode(v as Bs23DrillMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">Score %</label>
              <Input value={score} onChange={(e) => setScore(e.target.value)} type="number" min={0} max={100} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">Minutes</label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" min={1} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-muted-foreground">Difficulty</label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-muted-foreground">Notes (optional)</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What went wrong?" />
          </div>
          <Button onClick={handleSave} disabled={saving || !competencyId}>
            {saving ? "Saving…" : "Save evidence"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
