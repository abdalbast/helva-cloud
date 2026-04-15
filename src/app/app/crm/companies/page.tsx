"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAppQuery, useAppMutation } from "@/lib/app-data";
import { DataTable, type Column } from "@/components/data-table";
import { FormDialog, type FieldDef } from "@/components/form-dialog";
import { Plus } from "lucide-react";
import Link from "next/link";

type Company = {
  _id: string;
  name: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  notes: string | null;
};

type CompanyFormValues = {
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  notes?: string;
};

const fields: FieldDef[] = [
  { name: "name", label: "Name", required: true },
  { name: "website", label: "Website", type: "url" },
  { name: "industry", label: "Industry" },
  { name: "size", label: "Size" },
  { name: "notes", label: "Notes", type: "textarea" },
];

const baseColumns: Column<Company>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "website", label: "Website", sortable: true },
  { key: "industry", label: "Industry", sortable: true },
  { key: "size", label: "Size" },
];

export default function CompaniesPage() {
  const companies = useAppQuery(api.companies.list, "companies") ?? [];
  const createCompany = useAppMutation(api.companies.create, "companies", "create");
  const updateCompany = useAppMutation(api.companies.update, "companies", "update");
  const removeCompany = useAppMutation(api.companies.remove, "companies", "remove");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CompanyFormValues>({ name: "" });
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setFormValues({ name: "" });
      setEditId(null);
      setShowForm(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editId) {
        await updateCompany({ id: editId as Id<"companies">, ...formValues });
      } else {
        await createCompany({ ...formValues });
      }
      setShowForm(false);
      setEditId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this company?")) return;
    await removeCompany({ id: id as Id<"companies"> });
  };

  const openEdit = (c: Company) => {
    setFormValues({
      name: c.name,
      website: c.website ?? "",
      industry: c.industry ?? "",
      size: c.size ?? "",
      notes: c.notes ?? "",
    });
    setEditId(c._id);
    setShowForm(true);
  };

  return (
    <div>
      <div>
        <Link href="/app/crm" className="text-caption text-foreground/50 hover:text-mistral-orange transition">
          ← CRM
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <h1 className="text-card-title">Companies</h1>
          <button
            onClick={() => { setFormValues({ name: "" }); setEditId(null); setShowForm(true); }}
            className="flex items-center gap-1 rounded-[2px] bg-mistral-orange px-3 py-1.5 text-sm text-surface-pure hover:bg-mistral-flame active:scale-[0.98] transition"
          >
            <Plus className="h-4 w-4" /> Add Company
          </button>
        </div>
      </div>

      <div className="mt-6">
        <DataTable
          columns={[
            ...baseColumns,
            {
              key: "_actions",
              label: "",
              render: (c) => (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }}
                  className="text-caption text-foreground/40 hover:text-mistral-orange"
                >
                  Delete
                </button>
              ),
            },
          ]}
          data={companies}
          keyFn={(c) => c._id}
          onRowClick={(c) => openEdit(c as Company)}
        />
      </div>

      {showForm && (
        <FormDialog
          title={editId ? "Edit Company" : "New Company"}
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
