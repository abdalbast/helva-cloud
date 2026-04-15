"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { DataTable, type Column } from "@/components/data-table";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus, Users, DollarSign, UserCheck, Handshake } from "lucide-react";
import Link from "next/link";

const PARTNER_TYPES = ["affiliate", "referral", "partner", "sponsor"] as const;
const PARTNER_STATUSES = ["active", "prospective", "inactive"] as const;

type PartnerType = (typeof PARTNER_TYPES)[number];
type PartnerStatus = (typeof PARTNER_STATUSES)[number];

type Partner = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  type: PartnerType;
  status: PartnerStatus;
  commissionRate: number | null;
  notes: string | null;
  referredDealCount: number;
  referredDealValue: number;
};

type PartnerFormValues = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  type: string;
  status?: string;
  commissionRate?: string;
  notes?: string;
};

function isPartnerType(value: string): value is PartnerType {
  return PARTNER_TYPES.includes(value as PartnerType);
}

function isPartnerStatus(value: string): value is PartnerStatus {
  return PARTNER_STATUSES.includes(value as PartnerStatus);
}

const fields: FieldDef[] = [
  { name: "firstName", label: "First Name", required: true },
  { name: "lastName", label: "Last Name", required: true },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "company", label: "Company/Org" },
  { name: "type", label: "Type", type: "select", required: true, options: PARTNER_TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) })) },
  { name: "status", label: "Status", type: "select", options: PARTNER_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })) },
  { name: "commissionRate", label: "Commission %", type: "number", placeholder: "e.g. 10" },
  { name: "notes", label: "Notes", type: "textarea" },
];

const typeColor: Record<string, string> = {
  affiliate: "bg-sunshine-500/20 text-sunshine-700",
  referral: "bg-block-gold/30 text-sunshine-900",
  partner: "bg-mistral-orange/15 text-mistral-orange",
  sponsor: "bg-surface-warm text-foreground/70",
};

const baseColumns: Column<Partner>[] = [
  {
    key: "firstName",
    label: "Name",
    sortable: true,
    render: (p) => `${p.firstName} ${p.lastName}`,
  },
  { key: "company", label: "Company", sortable: true },
  {
    key: "type",
    label: "Type",
    sortable: true,
    render: (p) => (
      <span className={`inline-block rounded-[2px] px-2 py-0.5 text-caption ${typeColor[p.type] ?? ""}`}>
        {p.type.charAt(0).toUpperCase() + p.type.slice(1)}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (p) => (
      <span className={`text-caption ${p.status === "active" ? "text-sunshine-700" : p.status === "inactive" ? "text-foreground/40" : "text-foreground/70"}`}>
        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
      </span>
    ),
  },
  {
    key: "commissionRate",
    label: "Commission",
    render: (p) => p.commissionRate != null ? `${p.commissionRate}%` : "—",
  },
  {
    key: "referredDealCount",
    label: "Referred Deals",
    render: (p) => p.referredDealCount > 0 ? `${p.referredDealCount} (£${p.referredDealValue.toLocaleString()})` : "—",
  },
];

export default function PartnersPage() {
  const partners = useQuery(api.partners.list) ?? [];
  const stats = useQuery(api.partners.stats);
  const createPartner = useMutation(api.partners.create);
  const updatePartner = useMutation(api.partners.update);
  const removePartner = useMutation(api.partners.remove);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<PartnerFormValues>({ firstName: "", lastName: "", type: "affiliate" });
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setFormValues({ firstName: "", lastName: "", type: "affiliate" });
      setEditId(null);
      setShowForm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const filtered = filterType === "all" ? partners : partners.filter((p: Partner) => p.type === filterType);

  const handleSubmit = async () => {
    if (!isPartnerType(formValues.type)) {
      setError("Select a valid partner type.");
      return;
    }

    const parsedCommissionRate =
      formValues.commissionRate && formValues.commissionRate.trim()
        ? Number(formValues.commissionRate)
        : undefined;

    if (
      parsedCommissionRate !== undefined &&
      (!Number.isFinite(parsedCommissionRate) || parsedCommissionRate < 0)
    ) {
      setError("Commission must be a non-negative number.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const basePayload = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email || undefined,
        phone: formValues.phone || undefined,
        company: formValues.company || undefined,
        type: formValues.type,
        status: formValues.status && isPartnerStatus(formValues.status) ? formValues.status : undefined,
        commissionRate: parsedCommissionRate,
        notes: formValues.notes || undefined,
      };
      if (editId) {
        await updatePartner({
          id: editId as Id<"partners">,
          ...basePayload,
          commissionRate: basePayload.commissionRate ?? null,
        });
      } else {
        await createPartner(basePayload);
      }
      setShowForm(false);
      setEditId(null);
    } catch {
      setError("Partner could not be saved. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this partner?")) return;
    setError(null);
    try {
      await removePartner({ id: id as Id<"partners"> });
    } catch {
      setError("Partner could not be deleted. Please try again.");
    }
  };

  const openEdit = (p: Partner) => {
    setFormValues({
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email ?? "",
      phone: p.phone ?? "",
      company: p.company ?? "",
      type: p.type,
      status: p.status,
      commissionRate: p.commissionRate != null ? String(p.commissionRate) : "",
      notes: p.notes ?? "",
    });
    setEditId(p._id);
    setShowForm(true);
  };

  const s = stats ?? { total: 0, active: 0, byType: {} as Record<string, number>, referredRevenue: 0 };

  return (
    <div>
      <div>
        <Link href="/app/crm" className="text-caption text-foreground/50 hover:text-mistral-orange transition">
          ← CRM
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <h1 className="text-card-title">Partners</h1>
          <button
            onClick={() => { setFormValues({ firstName: "", lastName: "", type: "affiliate" }); setEditId(null); setShowForm(true); }}
            className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition"
          >
            <Plus className="h-4 w-4" /> Add Partner
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Partners" value={s.total} />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Active" value={s.active} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Referred Revenue" value={`£${s.referredRevenue.toLocaleString()}`} />
        <StatCard icon={<Handshake className="h-5 w-5" />} label="Affiliates" value={s.byType?.affiliate ?? 0} />
      </div>

      <div className="mt-6 flex gap-2">
        {["all", ...PARTNER_TYPES].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-[2px] px-3 py-1.5 text-caption capitalize transition ${filterType === t ? "border border-sunshine-700/30 bg-surface-cream text-foreground" : "border border-foreground/10 text-foreground/50 hover:bg-surface-cream/50"}`}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {error ? (
          <div className="mb-4 rounded-[2px] border border-mistral-orange/20 bg-mistral-orange/10 px-3 py-2 text-sm text-mistral-orange">
            {error}
          </div>
        ) : null}
        <DataTable
          columns={[
            ...baseColumns,
            {
              key: "_actions",
              label: "",
              render: (p) => (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                  className="text-caption text-foreground/40 hover:text-mistral-orange"
                >
                  Delete
                </button>
              ),
            },
          ]}
          data={filtered}
          keyFn={(p) => p._id}
          onRowClick={(p) => openEdit(p as Partner)}
        />
      </div>

      {showForm && (
        <FormDialog
          title={editId ? "Edit Partner" : "New Partner"}
          fields={fields}
          values={formValues}
          onChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditId(null); }}
          loading={loading}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-[2px] border border-foreground/10 bg-surface-pure p-4 shadow-golden">
      <div className="flex items-center gap-2 text-foreground/50">
        {icon}
        <span className="text-caption uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-feature mt-2">{typeof value === "number" ? value.toLocaleString() : value}</div>
    </div>
  );
}
