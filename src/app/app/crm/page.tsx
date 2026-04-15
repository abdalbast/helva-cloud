"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Users, Building2, Handshake, Clock, Users2, Plus, Upload, Phone, FileText, Sparkles } from "lucide-react";
export default function CRMDashboard() {
  const contacts = useQuery(api.contacts.list) ?? [];
  const companies = useQuery(api.companies.list) ?? [];
  const deals = useQuery(api.deals.list) ?? [];
  const followUps = useQuery(api.followUps.list) ?? [];
  const activities = useQuery(api.activities.listRecent) ?? [];
  const partners = useQuery(api.partners.count) ?? 0;

  const openDeals = deals.filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost");
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const weightedPipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0) * ((d.probability ?? 0) / 100), 0);
  const overdueFollowUps = followUps.filter((f) => f.status === "pending" && f.dueAt && new Date(f.dueAt) <= new Date()).length;
  const hasData = contacts.length > 0 || companies.length > 0 || deals.length > 0;

  const recentActivities = activities.slice(0, 5);

  const stageOrder = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];
  const stages = stageOrder.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-card-title">CRM</h1>
        <div className="flex gap-2">
          <Link href="/app/crm/contacts?action=new" className="rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition">
            + New Contact
          </Link>
          <Link href="/app/crm/partners?action=new" className="rounded-[2px] border border-mistral-orange px-3 py-1.5 text-sm text-mistral-orange hover:bg-mistral-orange/5 transition">
            + New Partner
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Contacts" value={contacts.length} href="/app/crm/contacts" />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Companies" value={companies.length} href="/app/crm/companies" />
        <StatCard icon={<Users2 className="h-5 w-5" />} label="Partners" value={partners} href="/app/crm/partners" />
        <StatCard icon={<Handshake className="h-5 w-5" />} label="Open Deals" value={openDeals.length} href="/app/crm/deals" />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Overdue Follow-ups" value={overdueFollowUps} href="/app/crm/follow-ups" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden transition hover:bg-surface-cream hover:text-foreground hover:border-sunshine-700/30">
          <div className="text-caption uppercase tracking-wide text-foreground/60">Pipeline Value</div>
          <div className="text-feature mt-1">£{pipelineValue.toLocaleString()}</div>
        </div>
        <div className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden transition hover:bg-surface-cream hover:text-foreground hover:border-sunshine-700/30">
          <div className="text-caption uppercase tracking-wide text-foreground/60">Weighted Pipeline</div>
          <div className="text-feature mt-1 text-sunshine-700">£{Math.round(weightedPipelineValue).toLocaleString()}</div>
          <div className="text-caption text-foreground/50 mt-1">Based on probability</div>
        </div>
      </div>

      {!hasData && (
        <div className="mt-8 rounded-[2px] border border-dashed border-foreground/20 bg-surface-cream/30 p-8 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-foreground/30" />
          <h3 className="mt-4 text-feature">Welcome to your CRM</h3>
          <p className="text-body text-foreground/60 mt-2 max-w-md mx-auto">
            Get started by adding your first contact, importing from a file, or creating a deal.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/app/crm/contacts?action=new" className="inline-flex items-center gap-1.5 rounded-[2px] bg-mistral-orange px-4 py-2 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition">
              <Plus className="h-4 w-4" /> Add Contact
            </Link>
            <Link href="/app/crm/contacts" className="inline-flex items-center gap-1.5 rounded-[2px] border border-foreground/20 px-4 py-2 text-sm text-foreground/70 hover:bg-surface-cream transition">
              <Upload className="h-4 w-4" /> Import
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-feature">Quick Actions</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction href="/app/crm/contacts?action=new" icon={<Plus className="h-4 w-4" />} label="New Contact" />
          <QuickAction href="/app/crm/companies?action=new" icon={<Building2 className="h-4 w-4" />} label="New Company" />
          <QuickAction href="/app/crm/deals?action=new" icon={<Handshake className="h-4 w-4" />} label="New Deal" />
          <QuickAction href="/app/crm/partners?action=new" icon={<Users2 className="h-4 w-4" />} label="New Partner" />
          <QuickAction href="/app/crm/activities?action=new" icon={<Phone className="h-4 w-4" />} label="Log Activity" />
          <Link href="/app/crm/contacts" className="flex items-center gap-2 rounded-[2px] border border-foreground/10 bg-surface-pure px-3 py-2 text-sm text-foreground/70 hover:bg-surface-cream transition">
            <Upload className="h-4 w-4" /> Import Contacts
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-feature">Pipeline by Stage</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((s) => (
            <Link
              key={s.stage}
              href={`/app/crm/deals?stage=${s.stage}`}
              className="group rounded-[2px] border border-foreground/10 bg-surface-pure p-3 shadow-golden transition hover:border-sunshine-700/30 hover:bg-surface-cream"
            >
              <div className="text-caption capitalize text-foreground/60">{s.stage.replace("_", " ")}</div>
              <div className="text-body mt-1 font-normal">{s.count} deal{s.count !== 1 ? "s" : ""}</div>
              <div className="text-caption text-foreground/50 group-hover:text-sunshine-700">£{s.value.toLocaleString()}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-feature">Recent Activity</h2>
          <Link href="/app/crm/activities?action=new" className="text-caption text-mistral-orange hover:underline">
            + Log Activity
          </Link>
        </div>
        <div className="mt-3 space-y-2">
          {recentActivities.length === 0 && (
            <div className="rounded-[2px] border border-dashed border-foreground/20 bg-surface-cream/20 p-6 text-center">
              <FileText className="mx-auto h-6 w-6 text-foreground/30" />
              <p className="text-body text-foreground/50 mt-2">No activities yet.</p>
              <Link href="/app/crm/activities?action=new" className="text-caption text-mistral-orange hover:underline mt-1 inline-block">
                Log your first activity
              </Link>
            </div>
          )}
          {recentActivities.map((a) => (
            <div key={a._id} className="flex items-center gap-3 rounded-[2px] border border-foreground/10 bg-surface-pure p-3">
              <span className="shrink-0 rounded-[2px] bg-surface-cream px-2 py-0.5 text-caption capitalize">{a.type}</span>
              <span className="min-w-0 truncate text-sm">{a.subject}</span>
              <span className="ml-auto shrink-0 text-caption text-foreground/40">{new Date(a._creationTime).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="group rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden transition hover:bg-surface-cream hover:text-foreground hover:border-sunshine-700/30">
      <div className="flex items-center gap-2 text-foreground/50 group-hover:text-foreground">
        {icon}
        <span className="text-caption uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-feature mt-2">{value.toLocaleString()}</div>
    </Link>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-[2px] border border-foreground/10 bg-surface-pure px-3 py-2 text-sm text-foreground/70 transition hover:bg-surface-cream hover:text-foreground hover:border-sunshine-700/30">
      <span className="text-foreground/50">{icon}</span>
      {label}
    </Link>
  );
}
