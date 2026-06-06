"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { format, parseISO } from "date-fns";
import { NotebookPen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useJournal, useSessions } from "@/hooks/use-data";
import { db } from "@/lib/db";
import { nowISO, todayISO } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";

export default function JournalPage() {
  const entries = useJournal();
  const sessions = useSessions();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ learned: "", challenges: "", takeaways: "", nextActions: "", date: todayISO() });

  const todaySessions = sessions.filter((s) => s.date === form.date);

  const handleSave = async () => {
    await db.journal.add({
      id: uuid(),
      date: form.date,
      learned: form.learned,
      challenges: form.challenges,
      takeaways: form.takeaways,
      nextActions: form.nextActions,
      sessionIds: todaySessions.map((s) => s.id),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    setOpen(false);
    setForm({ learned: "", challenges: "", takeaways: "", nextActions: "", date: todayISO() });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <NotebookPen className="h-8 w-8 text-primary" /> Daily Journal
          </h1>
          <p className="text-muted-foreground mt-1">Reflect on your learning journey</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New Entry</Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <NotebookPen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No journal entries yet. Start reflecting on your learning!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const linkedSessions = sessions.filter((s) => entry.sessionIds.includes(s.id));
            return (
              <Card key={entry.id}>
                <CardHeader>
                  <CardTitle className="text-base">{format(parseISO(entry.date), "EEEE, MMMM d, yyyy")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {entry.learned && (
                    <div>
                      <h4 className="text-xs font-medium text-emerald-400 mb-1">What I Learned</h4>
                      <p className="text-sm">{entry.learned}</p>
                    </div>
                  )}
                  {entry.challenges && (
                    <div>
                      <h4 className="text-xs font-medium text-amber-400 mb-1">Challenges</h4>
                      <p className="text-sm">{entry.challenges}</p>
                    </div>
                  )}
                  {entry.takeaways && (
                    <div>
                      <h4 className="text-xs font-medium text-violet-400 mb-1">Key Takeaways</h4>
                      <p className="text-sm">{entry.takeaways}</p>
                    </div>
                  )}
                  {entry.nextActions && (
                    <div>
                      <h4 className="text-xs font-medium text-blue-400 mb-1">Next Actions</h4>
                      <p className="text-sm">{entry.nextActions}</p>
                    </div>
                  )}
                  {linkedSessions.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        {linkedSessions.length} linked session{linkedSessions.length > 1 ? "s" : ""} —{" "}
                        {formatDuration(linkedSessions.reduce((s, sess) => s + sess.duration, 0))}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <div>
              <label className="text-xs text-muted-foreground">What did you learn?</label>
              <Textarea value={form.learned} onChange={(e) => setForm({ ...form, learned: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Challenges faced</label>
              <Textarea value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Key takeaways</label>
              <Textarea value={form.takeaways} onChange={(e) => setForm({ ...form, takeaways: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Next actions</label>
              <Textarea value={form.nextActions} onChange={(e) => setForm({ ...form, nextActions: e.target.value })} />
            </div>
            {todaySessions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Will link {todaySessions.length} session{todaySessions.length > 1 ? "s" : ""} from this date
              </p>
            )}
            <Button onClick={handleSave} className="w-full">Save Entry</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
