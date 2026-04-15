"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Milestone, AlertTriangle, TrendingUp } from "lucide-react";
export default function TrackingPage() {
  const projects = useQuery(api.projects.list) ?? [];
  const tasks = useQuery(api.tasks.list) ?? [];

  const activeProjects = projects.filter((p) => p.status === "active");
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done");
  const completedThisWeek = tasks.filter((t) => t.status === "done").length;

  return (
    <div>
      <h1 className="text-card-title">Project Tracking</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
          <div className="flex items-center gap-2 text-foreground/50"><TrendingUp className="h-4 w-4" /><span className="text-caption uppercase">Active Projects</span></div>
          <div className="text-feature mt-2">{activeProjects.length}</div>
        </div>
        <div className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
          <div className="flex items-center gap-2 text-foreground/50"><AlertTriangle className="h-4 w-4" /><span className="text-caption uppercase">Overdue Tasks</span></div>
          <div className="text-feature mt-2 text-mistral-orange">{overdueTasks.length}</div>
        </div>
        <div className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
          <div className="flex items-center gap-2 text-foreground/50"><Milestone className="h-4 w-4" /><span className="text-caption uppercase">Completed Tasks</span></div>
          <div className="text-feature mt-2">{completedThisWeek}</div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-feature">Active Projects</h2>
        <div className="mt-3 space-y-2">
          {activeProjects.length === 0 && <p className="text-body text-foreground/40">No active projects.</p>}
          {activeProjects.map((p) => {
            const projectTasks = tasks.filter((t) => t.projectId === p._id);
            const done = projectTasks.filter((t) => t.status === "done").length;
            const total = projectTasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={p._id} className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-normal">{p.name}</span>
                  <span className="text-caption text-foreground/50">{done}/{total} tasks</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-surface-cream">
                  <div className="h-2 rounded-full bg-sunshine-700 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-caption text-foreground/40">{pct}% complete</div>
              </div>
            );
          })}
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-feature">Overdue Tasks</h2>
          <div className="mt-3 space-y-2">
            {overdueTasks.map((t) => (
              <div key={t._id} className="flex items-center gap-3 rounded-[2px] border border-mistral-orange/20 bg-surface-pure p-3">
                <AlertTriangle className="h-4 w-4 text-mistral-orange" />
                <span className="text-sm">{t.title}</span>
                <span className="ml-auto text-caption text-foreground/40">Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
