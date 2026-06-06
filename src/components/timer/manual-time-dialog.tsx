"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { db } from "@/lib/db";
import { nowISO, todayISO } from "@/lib/utils";
import { saveAutoBackup } from "@/lib/auto-backup";
import type { HierarchyPath } from "@/lib/types";

interface ManualTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: HierarchyPath;
  label: string;
}

export function ManualTimeDialog({ open, onOpenChange, path, label }: ManualTimeDialogProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!path.trackId || (hours === 0 && minutes === 0)) return;
    const duration = (hours * 3600 + minutes * 60) * 1000;
    const start = new Date(`${date}T09:00:00`);
    await db.sessions.add({
      id: uuid(),
      trackId: path.trackId,
      moduleId: path.moduleId,
      topicId: path.topicId,
      subtopicId: path.subtopicId,
      startTime: start.toISOString(),
      endTime: new Date(start.getTime() + duration).toISOString(),
      duration,
      date,
      notes: notes || undefined,
      manual: true,
      createdAt: nowISO(),
    });
    await saveAutoBackup();
    onOpenChange(false);
    setHours(0);
    setMinutes(30);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Add Manual Time
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Hours</label>
            <Input type="number" min={0} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground">Minutes</label>
            <Input type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
          </div>
        </div>
        <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button onClick={handleSave} className="w-full">Save Time</Button>
      </DialogContent>
    </Dialog>
  );
}
